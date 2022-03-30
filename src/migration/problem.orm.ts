import { ProblemInterface, TestCase } from '../api/models/problem.model';
import { Connection, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';
import {
  constructSqlSelect,
  constructSqlUpdate,
  Table,
  QueryOptions,
  UpdateProblem
} from './query';

export interface ProblemDocument extends ProblemInterface {
  _id: number;
  moduleId: number;
}

// All properties of ProblemDocument except code and testCases; all fields optional
export type ProblemQueryFilter = Partial<
  Omit<ProblemDocument, 'code' | 'testCases'>
>;

// TODO: Need to move this to query.ts, and omit 'code' and 'testcase'
// ProblemDocument._id omitted since it should not be updated
export type ProblemUpdate = Readonly<
  Partial<Omit<ProblemDocument, '_id' | 'moduleId'>>
>;

interface CodeInterface {
  header: string;
  body: string;
  footer: string;
}

export class ProblemOrm {
  private _conn: Connection;

  constructor(conn: Connection) {
    this._conn = conn;
  }

  async find(filter: ProblemQueryFilter): Promise<ProblemDocument[]> {
    return this._find(filter, 0);
  }

  async findOne(filter: ProblemQueryFilter): Promise<ProblemDocument> {
    const result = await this._find(filter, 1);
    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  async findAll(): Promise<ProblemDocument[]> {
    return this.find({});
  }

  // Included for back compatability with Mongoose API
  // Equivalent to findOne({ _id: id })
  async findById(id: number): Promise<ProblemDocument> {
    return this.findOne({ _id: id });
  }

  async findByIdAndUpdate(
    id: number,
    update: ProblemUpdate,
    options: QueryOptions
  ): Promise<ProblemDocument> {
    if (options.new) {
      await this.updateById(id, update, options);
      return this.findById(id);
    } else {
      const result = await this.findById(id);
      await this.updateById(id, update, options);
      return result;
    }
  }

  private async _find(
    filter: ProblemQueryFilter,
    limit: number
  ): Promise<ProblemDocument[]> {
    return new Promise((resolve, reject) => {
      const result = this._findProblems(
        this._conn,
        this.constructSQLQuery(filter, limit),
        (err) => {
          if (err) {
            reject(err);
          }
        }
      );
      resolve(result);
    });
  }
  // TODO: Add a docstring explaining constraints on the query string
  private async _findProblems(
    conn: Connection,
    query: string,
    callback: (err) => void
  ): Promise<ProblemDocument[]> {
    return new Promise((resolve, reject) => {
      this.queryProblem(
        conn,
        query,
        async (err, problems: Partial<ProblemDocument>[]) => {
          if (err) {
            reject(err);
          } else {
            const result: ProblemDocument[] = [];
            if (problems.length != 0) {
              for (const problem of problems) {
                const codes: CodeInterface[] =
                  await this.findCodeByProblemTitle(conn, problem.title);
                if (codes.length == 0) {
                  problem.code = undefined;
                } else {
                  // Pick the first code entry found
                  problem.code = codes[0];
                }
                problem.testCases = await this.findTestCasesByProblemTitle(
                  conn,
                  problem.title
                );
                result.push(this.completeProblem(problem));
              }
            }
            resolve(result);
          }
          callback(err);
        }
      );
    });
  }

  private decomposeProblemUpdate(
    update: ProblemUpdate
  ): [UpdateProblem, CodeInterface, TestCase[]] {
    const { code, testCases, ..._update } = update;
    return [_update, code, testCases];
  }

  private updateById(
    id: number,
    update: ProblemUpdate,
    options: QueryOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const [updatedProblem, updatedCode, updatedTests] =
        this.decomposeProblemUpdate(update);
      this._conn.query(
        constructSqlUpdate(Table.Problem, { _id: id }, updatedProblem, options),
        async (err) => {
          if (err) {
            reject(err);
          } else {
            if (update.code != null) {
              await this.updateCode(this._conn, id, updatedCode);
            }
            if (update.testCases != null) {
              await this.deleteTestCases(this._conn, id);
              await this.insertTestCases(this._conn, id, updatedTests);
            }
            resolve();
          }
        }
      );
    });
  }

  private updateCode(
    conn: Connection,
    problemId: number,
    code: CodeInterface
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      conn.query(
        `
        UPDATE Code
        SET
          header = ?,
          body = ?,
          footer = ?
        WHERE problem_id = ?
        `,
        [code.header, code.body, code.footer, problemId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private deleteTestCases(conn: Connection, problemId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      conn.query(
        `
        DELETE FROM TestCase
        WHERE problem_id = ?
        `,
        [problemId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  private insertTestCases(
    conn: Connection,
    problemId: number,
    testCases: TestCase[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (testCases.length > 0) {
        const query: string[] = [
          'INSERT INTO TestCase',
          '(input, expected_output, hint, visibility, problem_id)',
          'VALUES'
        ];
        query.push(...Array(testCases.length - 1).fill('(?, ?, ?, ?, ?),'));
        query.push('(?, ?, ?, ?, ?)');
        const params: any[] = [];
        testCases.forEach((test) =>
          params.push(
            test.input,
            test.expectedOutput,
            test.hint,
            test.visibility,
            problemId
          )
        );
        conn.query(query.join('\n'), params, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  private queryProblem(
    conn: Connection,
    query: string,
    callback: (err, partial: Partial<ProblemDocument>[]) => void
  ) {
    conn.query(query, (err, rows) => {
      if (err) {
        callback(err, []);
      } else {
        const problems: Partial<ProblemDocument>[] = this.problemsFromRows(
          this.extractRowDataPackets(rows)
        );
        callback(false, problems);
      }
    });
  }

  private problemsFromRows(rows: RowDataPacket[]): Partial<ProblemDocument>[] {
    const problems: Partial<ProblemDocument>[] = [];
    for (const row of rows) {
      problems.push(this.problemFromRow(row));
    }
    return problems;
  }

  private problemFromRow(row: RowDataPacket): Partial<ProblemDocument> {
    return {
      _id: row.id,
      statement: row.statement,
      title: row.title,
      hidden: Boolean(row.hidden),
      language: row.language,
      dueDate: row.due_date,
      fileExtension: row.file_extension,
      templatePackage: row.template_package,
      timeLimit: row.time_limit,
      memoryLimit: row.memory_limit,
      buildCommand: row.build_command,
      moduleId: row.module_id
    };
  }

  private completeProblem(problem: Partial<ProblemDocument>): ProblemDocument {
    for (const key in problem) {
      if (problem[key] === undefined) {
        // TODO: This will return undefined if problem.code is undefined. Is this what we want?
        return undefined;
      }
    }
    return <ProblemDocument>{
      _id: problem._id,
      statement: problem.statement,
      title: problem.title,
      hidden: problem.hidden,
      language: problem.language,
      dueDate: problem.dueDate,
      code: problem.code,
      fileExtension: problem.fileExtension,
      testCases: problem.testCases,
      templatePackage: problem.templatePackage,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      buildCommand: problem.buildCommand,
      moduleId: problem.moduleId
    };
  }

  private findCodeByProblemTitle(
    conn: Connection,
    problemTitle: string
  ): Promise<CodeInterface[]> {
    return new Promise((resolve, reject) => {
      conn.query(
        `
        SELECT c.header, c.body, c.footer
        FROM Code AS c
        JOIN Problem AS p
        ON c.problem_id = p.id
        WHERE p.title = ?
        `,
        [problemTitle],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const codes: CodeInterface[] = this.codesFromRows(
              this.extractRowDataPackets(rows)
            );
            resolve(codes);
          }
        }
      );
    });
  }

  private findTestCasesByProblemTitle(
    conn: Connection,
    problemTitle: string
  ): Promise<TestCase[]> {
    return new Promise((resolve, reject) => {
      conn.query(
        `
        SELECT t.input, t.expected_output AS expectedOutput, t.hint, t.visibility
        FROM TestCase as t
        JOIN Problem as p
        ON t.problem_id = p.id
        WHERE p.title = ?
        `,
        [problemTitle],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const tests: TestCase[] = this.testCasesFromRows(
              this.extractRowDataPackets(rows)
            );
            resolve(tests);
          }
        }
      );
    });
  }

  private codesFromRows(rows: RowDataPacket[]): CodeInterface[] {
    const codes: CodeInterface[] = rows.map(
      (row) =>
        <CodeInterface>{
          header: row.header,
          body: row.body,
          footer: row.footer
        }
    );
    return codes;
  }

  private testCasesFromRows(rows: RowDataPacket[]): TestCase[] {
    const tests: TestCase[] = rows.map(
      (row) =>
        <TestCase>{
          input: row.input,
          expectedOutput: row.expectedOutput,
          hint: row.hint,
          visibility: row.visibility
        }
    );
    return tests;
  }

  private extractRowDataPackets(
    rows:
      | RowDataPacket[]
      | RowDataPacket[][]
      | OkPacket
      | OkPacket[]
      | ResultSetHeader
  ): RowDataPacket[] {
    if (
      rows.constructor.name !== 'OkPacket' &&
      rows.constructor.name !== 'ResultSetHeader'
    ) {
      // Drop rows not of type RowDataPacket
      rows = rows as RowDataPacket[] | RowDataPacket[][] | OkPacket[];
      (rows as unknown[]).filter(
        (row) => row.constructor.name === 'RowDataPacket'
      );
      return rows as RowDataPacket[];
    } else {
      return [];
    }
  }

  private constructSQLQuery(filter: ProblemQueryFilter, limit: number): string {
    return constructSqlSelect(Table.Problem, filter, { limit: limit });
  }
}

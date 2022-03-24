import { ProblemInterface, TestCase } from '../api/models/problem.model';
import {
  Connection,
  RowDataPacket,
  OkPacket,
  ResultSetHeader,
  format
} from 'mysql2';

export interface ProblemDocument extends ProblemInterface {
  _id: number;
}

// All properties of ProblemDocument except code and testCases; all fields optional
export type ProblemQueryFilter = Partial<
  Omit<ProblemDocument, 'code' | 'testCases'>
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
    return new Promise((resolve, reject) => {
      const result = this._findProblems(
        this._conn,
        this.constructSQLQuery(filter),
        (err) => {
          if (err) {
            reject(err);
          }
        }
      );
      resolve(result);
    });
  }

  async findAll(): Promise<ProblemDocument[]> {
    return this.find({});
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
      hidden: row.hidden,
      language: row.language,
      dueDate: row.due_date,
      fileExtension: row.file_extension,
      templatePackage: row.template_package,
      timeLimit: row.time_limit,
      memoryLimit: row.memory_limit,
      buildCommand: row.build_command
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
      buildCommand: problem.buildCommand
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

  // TODO: Make this private
  // TODO: Add a docstring
  constructSQLQuery(filter: ProblemQueryFilter): string {
    interface QueryArg {
      column: string;
      value: any;
    }
    const args: QueryArg[] = Object.entries(filter).map(
      ([key, value]) =>
        <QueryArg>{ column: this.problemPropertyToSqlColumn(key), value: value }
    );
    if (args.length > 0) {
      const query: string[] = ['SELECT *', 'FROM Problem', 'WHERE'];
      query.push(...Array(args.length - 1).fill('?? = ? AND'));
      query.push('?? = ?');
      const argsRaw: any[] = [];
      args.forEach((arg) => argsRaw.push(arg.column, arg.value));
      return format(query.join('\n'), argsRaw);
    } else {
      return 'SELECT * FROM Problem';
    }
  }

  // Maps from ProblemDocument property names to corresponding MySQL column name
  private problemPropertyToSqlColumn(propName: string): string {
    const camelCaseToSnakeCase = (str: string) =>
      str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    if (propName === '_id') {
      return 'id';
    } else {
      return camelCaseToSnakeCase(propName);
    }
  }
}

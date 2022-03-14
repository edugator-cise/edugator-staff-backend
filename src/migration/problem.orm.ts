import { ProblemInterface } from '../api/models/problem.model';
import {
  Connection,
  // Pool,
  RowDataPacket,
  OkPacket,
  ResultSetHeader
} from 'mysql2';
// import pool from './pool';

// Is this possible without code duplication from ProblemInterface?
// interface ProblemQueryFilter {
//   id?: number;
//   hidden?: boolean;
// }

class ProblemOrm {
  // private _pool: Pool;

  // constructor(pool: Pool) {
  //   this._pool = pool;
  // }

  // find(filter: ProblemQueryFilter): ProblemInterface[] {
  //   if (!filter.id) {
  //     if (filter.hidden === undefined) {
  //       return this.findAll();
  //     } else {
  //       return this.findByHidden(filter.hidden);
  //     }
  //   } else {
  //     if (filter.hidden === undefined) {
  //       return this.findById(filter.id);
  //     } else {
  //       return this.findByIdAndHidden(filter.id, filter.hidden);
  //     }
  //   }
  // }

  // private findById(id: number): ProblemInterface[] {
  //   return []; // TODO
  // }

  // private findByHidden(hidden: boolean): ProblemInterface[] {
  //   return []; // TODO
  // }

  // private findByIdAndHidden(id: number, hidden: boolean): ProblemInterface[] {
  //   return []; // TODO
  // }

  async findAll(conn: Connection): Promise<ProblemInterface[]> {
    const result: ProblemInterface[] = [];

    const problems: Partial<ProblemInterface>[] = await this.queryProblem(
      conn,
      'SELECT * FROM Problem'
    );

    if (problems.length != 0) {
      for (const problem of problems) {
        problem.code = {
          header: '',
          body: '',
          footer: ''
        };
        problem.testCases = [];
        result.push(this.completeProblem(problem));
      }
      // TODO: Get code and test cases, then build object
    }
    return result; // TODO
  }

  private async queryProblem(
    conn: Connection,
    query: string
  ): Promise<Partial<ProblemInterface>[]> {
    let problems: Partial<ProblemInterface>[] = [];
    conn.query(query, (err, rows) => {
      if (err) {
        throw err;
      } else {
        problems = this.problemsFromRows(rows);
      }
    });
    return problems;
  }

  private problemsFromRows(
    rows:
      | RowDataPacket[]
      | RowDataPacket[][]
      | OkPacket
      | OkPacket[]
      | ResultSetHeader
  ): Partial<ProblemInterface>[] {
    const problems: Partial<ProblemInterface>[] = [];
    if (
      rows.constructor.name !== 'OkPacket' &&
      rows.constructor.name !== 'ResultSetHeader'
    ) {
      // Drop rows not of type RowDataPacket
      rows = rows as RowDataPacket[] | RowDataPacket[][] | OkPacket[];
      (rows as unknown[]).filter(
        (row) => row.constructor.name === 'RowDataPacket'
      );
      for (const row of rows) {
        problems.push(this.problemFromRow(row as RowDataPacket));
      }
    }
    return problems;
  }

  private problemFromRow(row: RowDataPacket): Partial<ProblemInterface> {
    return {
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

  private completeProblem(
    problem: Partial<ProblemInterface>
  ): ProblemInterface {
    for (const key in problem) {
      if (problem[key] === undefined) {
        return undefined;
      }
    }
    return <ProblemInterface>{
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
}

export const Problem = new ProblemOrm();

import { ProblemInterface } from '../api/models/problem.model';
import { Pool, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';
import pool from './pool';

// Is this possible without code duplication from ProblemInterface?
interface ProblemQueryFilter {
  id?: number;
  hidden?: boolean;
}

const PROBLEM_TABLE_COLUMNS: string[] = [
  'id',
  'statement',
  'title',
  'hidden',
  'language',
  'due_date',
  'file_extension',
  'template_package',
  'time_limit',
  'memory_limit',
  'build_command',
  'module_id'
];

class ProblemOrm {
  private _pool: Pool;

  constructor(pool: Pool) {
    this._pool = pool;
  }

  find(filter: ProblemQueryFilter): ProblemInterface {
    if (!filter.id) {
      if (filter.hidden === undefined) {
        return this.findAll();
      } else {
        return this.findByHidden(filter.hidden);
      }
    } else {
      if (filter.hidden === undefined) {
        return this.findById(filter.id);
      } else {
        return this.findByIdAndHidden(filter.id, filter.hidden);
      }
    }
  }

  private findById(id: number): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }

  private findByHidden(hidden: boolean): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }

  private findByIdAndHidden(id: number, hidden: boolean): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }

  private findAll(): ProblemInterface {
    this._pool.getConnection((err, conn) => {
      if (err) {
        throw err;
      }

      let problems: Partial<ProblemInterface>[] = [];
      conn.query(
        `SELECT 
          statement,
          title,
          hidden,
          language,
          due_date,
          file_extension,
          template_package,
          time_limit,
          memory_limit,
          build_command,
        FROM Problem`,
        (err, rows, fields) => {
          if (err) {
            throw err;
          } else {
            problems = this.problemsFromRows(rows);
          }
        }
      );

      // TODO: Get code and test cases, then build object
    });
    return {} as ProblemInterface; // TODO
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
}

export const Problem = new ProblemOrm(pool);

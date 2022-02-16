import { ProblemInterface } from '../api/models/problem.model';
import { Pool } from 'mysql2';
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

      let problems: any[] = [];
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
            problems = rows;
          }
        }
      );

      // TODO: Get code and test cases, then build object
    });
    return {} as ProblemInterface; // TODO
  }
}

export const Problem = new ProblemOrm(pool);

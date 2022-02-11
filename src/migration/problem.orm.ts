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

  findById(id: number): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }

  findByHidden(hidden: boolean): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }

  findByIdAndHidden(id: number, hidden: boolean): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }

  findAll(): ProblemInterface {
    return {} as ProblemInterface; // TODO
  }
}

export const Problem = new ProblemOrm(pool);

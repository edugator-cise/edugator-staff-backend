import { Connection, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';
import {
  constructSqlSelect,
  Table,
  QueryOptions,
  UpdateModule,
  ModuleUpdate,
  constructSqlUpdate
} from './query';
import { ProblemDocument, ProblemOrm, ProblemQueryFilter } from './problem.orm';
import { ProblemInterface } from '../api/models/problem.model';

// temporary - needs to be migrated out into model.ts probably
// fixed to use problemDocument[] as opposed to [Types.ObjectId]
export interface ModuleInterface {
  name: string;
  number: number;
  problems: ProblemDocument[];
}

export interface ModuleDocument extends ModuleInterface {
  _id: number;
}

// would we want to Omit the 'problems' row here?
export type ModuleQueryFilter = Partial<Omit<ModuleDocument, 'problems'>>;

export class ModuleOrm {
  private _conn: Connection;
  private _problemOrm: ProblemOrm;

  constructor(conn: Connection, problemOrm: ProblemOrm) {
    this._conn = conn;
    this._problemOrm = problemOrm;
  }

  async find(filter: ModuleQueryFilter): Promise<ModuleDocument[]> {
    return this._find(filter, 0);
  }

  async findOne(filter: ModuleQueryFilter): Promise<ModuleDocument> {
    const result = await this._find(filter, 1);
    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  }

  async findAll(): Promise<ModuleDocument[]> {
    return this.find({});
  }

  async findById(id: number): Promise<ModuleDocument> {
    return this.findOne({ _id: id });
  }

  async findByIdAndUpdate(
    id: number,
    update: ModuleUpdate,
    options: QueryOptions
  ): Promise<ModuleDocument> {
    if (options.new) {
      this.updateById(id, update, options);
      return this.findById(id);
    } else {
      const result = await this.findById(id);
      await this.updateById(id, update, options);
      return result;
    }
  }

  private async _find(
    filter: ModuleQueryFilter,
    limit: number
  ): Promise<ModuleDocument[]> {
    return new Promise((resolve, reject) => {
      const result = this._findModules(
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

  // TODO: Convert over
  // TODO: Add a docstring explaining constraints on the query string
  private async _findModules(
    conn: Connection,
    query: string,
    callback: (err) => void
  ): Promise<ModuleDocument[]> {
    return new Promise((resolve, reject) => {
      this.queryModule(
        conn,
        query,
        async (err, modules: Partial<ModuleDocument>[]) => {
          if (err) {
            reject(err);
          } else {
            const result: ModuleDocument[] = [];
            if (modules.length != 0) {
              for (const module of modules) {
                const problems: ProblemDocument[] = await this._problemOrm.find(
                  { moduleId: module._id }
                );
                if (problems.length == 0) {
                  module.problems = undefined;
                } else {
                  module.problems = problems;
                }
                result.push(this.completeModule(module));
              }
            }
            resolve(result);
          }
          callback(err);
        }
      );
    });
  }

  private decomposeModuleUpdate(
    update: ModuleUpdate
  ): [UpdateModule, ProblemInterface[]] {
    const { problems, ..._update } = update;
    return [_update, problems];
  }

  private updateById(
    id: number,
    update: ModuleUpdate,
    options: QueryOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const [updatedModule, updatedProblems] =
        this.decomposeModuleUpdate(update);
      this._conn.query(
        constructSqlUpdate(Table.Module, { _id: id }, updatedModule, options),
        async (err) => {
          if (err) {
            reject(err);
          } else {
            // TODO: Delete all the problems associated with this moduleID

            // TODO: Re-add all the problems associated with this moduleID, using updatedProblems

            // if (update.problems != null) {
            //   // update all problems 1 by 1
            //   // for (const problem of update.problems) {
            //   //   await this._problemOrm.findByIdAndUpdate(
            //   //     problem._id,
            //   //     problem,
            //   //     {}
            //   //   );
            //   // }
            // }
            resolve();
          }
        }
      );
    });
  }

  // // fix this to mimic problem ORM
  // private updateAndFindById(
  //   id: number,
  //   update: ModuleUpdate,
  //   options: QueryOptions
  // ): Promise<ModuleDocument> {
  //   return new Promise((resolve, reject) => {
  //     const [updatedModule, updatedProblems] =
  //       this.decomposeModuleUpdate(update);

  //     this._conn.query(
  //       constructSqlUpdate(Table.Module, { _id: id }, updatedModule, options),
  //       async (err) => {
  //         if (err) {
  //           reject(err);
  //         } else {
  //           if (update.problems != null) {
  //             // use the problem ORM
  //             // need to delete problems here
  //             // need to insert problems here now
  //           }

  //           resolve(this.findByIdAndUpdate(id));
  //         }
  //       }
  //     );
  //   });
  // }

  private queryModule(
    conn: Connection,
    query: string,
    callback: (err, partial: Partial<ModuleDocument>[]) => void
  ) {
    conn.query(query, (err, rows) => {
      if (err) {
        callback(err, []);
      } else {
        const modules: Partial<ModuleDocument>[] = this.modulesFromRows(
          this.extractRowDataPackets(rows)
        );
        callback(false, modules);
      }
    });
  }

  private modulesFromRows(rows: RowDataPacket[]): Partial<ModuleDocument>[] {
    const modules: Partial<ModuleDocument>[] = [];
    for (const row of rows) {
      modules.push(this.moduleFromRow(row));
    }
    return modules;
  }

  private moduleFromRow(row: RowDataPacket): Partial<ModuleDocument> {
    return {
      _id: row.id,
      name: row.name,
      number: row.number
    };
  }

  private completeModule(module: Partial<ModuleDocument>): ModuleDocument {
    for (const key in module) {
      if (module[key] === undefined) {
        return undefined;
      }
    }
    return <ModuleDocument>{
      _id: module._id,
      name: module.name,
      number: module.number,
      problems: module.problems
    };
  }

  //findProblemsByModule

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

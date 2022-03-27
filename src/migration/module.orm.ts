import { Connection, RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';
import { constructSqlSelect, Table } from './query';
import { ModuleInterface } from '../api/models/module.model';

export interface ModuleDocument extends ModuleInterface {
  _id: number;
}

// would we want to Omit the 'problems' row here?
export type ModuleQueryFilter = Partial<
  Omit<ModuleDocument, 'problems'>
>;

// should we create an interface here like CodeInterface in problem.orm, so we can
// grab results from finding the problems associated with a module?
interface ProblemInterface {

}

export class ModuleOrm {
  private _conn: Connection;

  constructor(conn: Connection) {
    this._conn = conn;
  }

  async find(filter: ModuleQueryFilter): Promise<ModuleDocument[]> {
    return new Promise((resolve, reject) => {
      const result = this._findModules(
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

  async findAll(): Promise<ModuleDocument[]> {
    return this.find({});
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
                const problems: ProblemInterface[] =
                //should this await query the problem ORM? will this get messy with data types - thoughts?
                  await this.findCodeByProblemTitle(conn, problem.title); // need to switch this to find problems off module id
                if (problems.length == 0) {
                  module.problems = undefined;
                } else {
                  // Pick the first code entry found
                  module.problems = problems[0];
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
      number: row.number // need there be any mention of problems here?
    };
  }

  private completeModule(module: Partial<ModuleDocument>): ModuleDocument {
    for (const key in module) {
      if (module[key] === undefined) {
        // TODO: This will return undefined if problem.code is undefined. Is this what we want?
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

  //TODO: something like problemsFromRows, findProblemsByModule?


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
  constructSQLQuery(filter: ModuleQueryFilter): string {
    return constructSqlSelect(Table.Module, filter, 0);
  }

}

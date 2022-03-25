// Utilities for constructing SQL queries for use by ORMs
import { ProblemQueryFilter, ProblemUpdate } from './problem.orm';
import { format } from 'mysql2';

export enum Table {
  Module = 'Module',
  Problem = 'Problem',
  User = 'User'
}

type Filter = ProblemQueryFilter;

type Update = ProblemUpdate;

interface QueryOptions {
  new?: boolean;
  limit?: number;
}

/**
 * Construct an SQL Select query for the database
 * @param {Table} table - The table from which to select
 * @param {Filter} filter - A filter capturing the conditions which the
 * select tuples must match. Compiles to the WHERE clause.
 * @param limit - The number of tuples to be selected. Compiles to LIMIT clause.
 * @returns A formatted SQL query with properly-escaped interpolated parameters.
 */
export function constructSqlSelect(
  table: Table,
  filter: Filter,
  options: QueryOptions
): string {
  const query: string[] = [];
  query.push('SELECT *');
  query.push(`FROM ${table}`);
  const [whereClause, params] = constructWhereClause(filter, table);
  query.push(...whereClause);
  if (options.limit !== undefined && options.limit > 0) {
    query.push('LIMIT ?');
    params.push(options.limit);
  }
  return format(query.join('\n'), params);
}

function constructWhereClause(filter: Filter, table: Table): [string[], any[]] {
  const whereClause: string[] = [];
  const params: any[] = [];
  interface FilterCondition {
    column: string;
    value: any;
  }
  const filterKeyToColumn = getKeyToColumnTranform(table);
  const filterConditions: FilterCondition[] = Object.entries(filter).map(
    ([key, value]) =>
      <FilterCondition>{ column: filterKeyToColumn(key), value: value }
  );
  if (filterConditions.length > 0) {
    whereClause.push('WHERE');
    whereClause.push(...Array(filterConditions.length - 1).fill('?? = ? AND'));
    whereClause.push('?? = ?');
    filterConditions.forEach((arg) => params.push(arg.column, arg.value));
  }
  return [whereClause, params];
}

function getKeyToColumnTranform(table: Table): (key: string) => string {
  const camelCaseToSnakeCase = (key: string) =>
    key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  switch (table) {
    case Table.Problem:
      return (key: string): string => {
        if (key === '_id') {
          return 'id';
        } else {
          return camelCaseToSnakeCase(key);
        }
      };
    // TODO: case Table.Module:
    // TODO: case Table.User:
    default:
      // Default to just returning the propery name
      return (str: string): string => str;
  }
}

export function constructSqlUpdate(
  table: Table,
  filter: Filter,
  update: Update,
  options: QueryOptions
): string | never {
  if (Object.entries(update).length === 0) {
    throw new Error('Empty update parameter, cannot compile UPDATE');
  }
  const query: string[] = [`UPDATE ${table}`, 'SET'];
  const params: any[] = [];
  interface UpdateAssignment {
    column: string;
    value: any;
  }
  const keyToColumn = getKeyToColumnTranform(table);
  const assignments: UpdateAssignment[] = Object.entries(update).map(
    ([key, value]) =>
      <UpdateAssignment>{ column: keyToColumn(key), value: value }
  );
  query.push(...Array(assignments.length).fill('?? = ?'));
  assignments.forEach((assignment) =>
    params.push(assignment.column, assignment.value)
  );
  const [whereClause, whereParams] = constructWhereClause(filter, table);
  query.push(...whereClause);
  params.push(...whereParams);
  if (options.limit !== undefined && options.limit > 0) {
    query.push('LIMIT ?');
    params.push(options.limit);
  }
  return format(query.join('\n'), params);
}

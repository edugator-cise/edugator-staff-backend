import { constructSqlSelect, Table } from '../src/migration/query';

describe('constructSqlSelect', () => {
  it('Checks construction of SELECT * FROM Problem Query', () => {
    const received = constructSqlSelect(Table.Problem, {}, {});
    const expected = 'SELECT * FROM `Problem`';
    const lex = (str: string) => str.split(/\s+/);
    expect(lex(received)).toEqual(lex(expected));
  });
});

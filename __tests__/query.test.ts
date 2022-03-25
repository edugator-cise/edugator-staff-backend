import { constructSqlSelect, constructSqlUpdate, Table } from '../src/migration/query';

describe('constructSqlSelect', () => {
  const lex = (str: string) => str.split(/\s+/);

  it('Checks construction of SELECT * FROM Problem Query', () => {
    const received = constructSqlSelect(Table.Problem, {}, {});
    const expected = 'SELECT * FROM `Problem`';
    expect(lex(received)).toEqual(lex(expected));
  });

  it('Checks construction of SELECT from Problem with limit=0', () => {
    expect(lex(constructSqlSelect(Table.Problem, {}, { limit: 0 }))).toEqual(
      lex('SELECT * FROM `Problem`')
    );
  });

  it('Checks construction of SELECT from Problem with limit=null', () => {
    expect(lex(constructSqlSelect(Table.Problem, {}, { limit: null }))).toEqual(
      lex('SELECT * FROM `Problem`')
    );
  });

  it('Checks construction of SELECT from Problem with limit=undefined', () => {
    expect(
      lex(constructSqlSelect(Table.Problem, {}, { limit: undefined }))
    ).toEqual(lex('SELECT * FROM `Problem`'));
  });

  it('Checks construction of SELECT from Problem with limit=integer', () => {
    expect(lex(constructSqlSelect(Table.Problem, {}, { limit: 5 }))).toEqual(
      lex('SELECT * FROM `Problem` LIMIT 5')
    );
  });

  it('Checks construction of SELECT from Problem with single-prop filter', () => {
    expect(
      lex(
        constructSqlSelect(
          Table.Problem,
          {
            title: 'Test Title 1'
          },
          {}
        )
      )
    ).toEqual(
      lex(
        `SELECT *
        FROM \`Problem\`
        WHERE
        \`title\` = 'Test Title 1'`
      )
    );
  });

  it('Checks construction of SELECT from Problem with all props in filter', () => {
    expect(
      lex(
        constructSqlSelect(
          Table.Problem,
          {
            _id: 1,
            statement: 'test statement 2',
            title: 'test title 2',
            hidden: false,
            language: 'cpp',
            dueDate: new Date('2022-12-31T01:00:00'),
            fileExtension: '.cpp',
            templatePackage: 'test template_package 2',
            timeLimit: 1.0,
            memoryLimit: 1.0,
            buildCommand: 'test build_command 2'
          },
          {}
        )
      )
    ).toEqual(
      lex(
        `SELECT *
        FROM \`Problem\`
        WHERE
        \`id\` = 1 AND
        \`statement\` = 'test statement 2' AND
        \`title\` = 'test title 2' AND
        \`hidden\` = false AND
        \`language\` = 'cpp' AND
        \`due_date\` = '2022-12-31 01:00:00.000' AND
        \`file_extension\` = '.cpp' AND
        \`template_package\` = 'test template_package 2' AND
        \`time_limit\` = 1 AND
        \`memory_limit\` = 1 AND
        \`build_command\` = 'test build_command 2'`
      )
    );
  });

  it('Checks construction of SELECT from Problem with all props in filter and limit', () => {
    expect(
      lex(
        constructSqlSelect(
          Table.Problem,
          {
            _id: 1,
            statement: 'test statement 2',
            title: 'test title 2',
            hidden: false,
            language: 'cpp',
            dueDate: new Date('2022-12-31T01:00:00'),
            fileExtension: '.cpp',
            templatePackage: 'test template_package 2',
            timeLimit: 1.0,
            memoryLimit: 1.0,
            buildCommand: 'test build_command 2'
          },
          { limit: 5 }
        )
      )
    ).toEqual(
      lex(
        `SELECT *
        FROM \`Problem\`
        WHERE
        \`id\` = 1 AND
        \`statement\` = 'test statement 2' AND
        \`title\` = 'test title 2' AND
        \`hidden\` = false AND
        \`language\` = 'cpp' AND
        \`due_date\` = '2022-12-31 01:00:00.000' AND
        \`file_extension\` = '.cpp' AND
        \`template_package\` = 'test template_package 2' AND
        \`time_limit\` = 1 AND
        \`memory_limit\` = 1 AND
        \`build_command\` = 'test build_command 2'
        LIMIT 5`
      )
    );
  });

  it('Checks construction of SQL UPDATE in Problem', () => {
    expect(
      lex(constructSqlUpdate(Table.Problem, {}, { title: 'Test Title' }, {}))
    ).toEqual(lex(`UPDATE \`Problem\` SET \`title\` = 'Test Title'`));
  });

  it('Checks construction of SQL UPDATE in Problem with limit=0', () => {
    expect(
      lex(
        constructSqlUpdate(
          Table.Problem,
          {},
          { title: 'Test Title' },
          { limit: 0 }
        )
      )
    ).toEqual(lex(`UPDATE \`Problem\` SET \`title\` = 'Test Title'`));
  });

  it('Checks construction of SQL UPDATE in Problem with limit=null', () => {
    expect(
      lex(
        constructSqlUpdate(
          Table.Problem,
          {},
          { title: 'Test Title' },
          { limit: null }
        )
      )
    ).toEqual(lex(`UPDATE \`Problem\` SET \`title\` = 'Test Title'`));
  });

  it('Checks construction of SQL UPDATE in Problem with limit=null', () => {
    expect(
      lex(
        constructSqlUpdate(
          Table.Problem,
          {},
          { title: 'Test Title' },
          { limit: undefined }
        )
      )
    ).toEqual(lex(`UPDATE \`Problem\` SET \`title\` = 'Test Title'`));
  });

  it('Checks construction of SQL UPDATE in Problem without filter and with limit', () => {
    expect(
      lex(
        constructSqlUpdate(
          Table.Problem,
          {},
          { title: 'Test Title' },
          { limit: 5 }
        )
      )
    ).toEqual(lex(`UPDATE \`Problem\` SET \`title\` = 'Test Title' LIMIT 5`));
  });

  it('Checks construction of SQL UPDATE in Problem with single-prop filter', () => {
    expect(
      lex(
        constructSqlUpdate(
          Table.Problem,
          { _id: 5 },
          { title: 'Test Title' },
          {}
        )
      )
    ).toEqual(
      lex(`UPDATE \`Problem\` SET \`title\` = 'Test Title' WHERE \`id\` = 5`)
    );
  });

  it('Checks construction of SQL UPDATE in Problem with multi-filter, multi-update, and limit', () => {
    expect(
      lex(
        constructSqlUpdate(
          Table.Problem,
          { _id: 5, language: 'java' },
          { title: 'Test Title', language: 'cpp' },
          { limit: 15 }
        )
      )
    ).toEqual(
      lex(
        `UPDATE \`Problem\`
        SET
        \`title\` = 'Test Title',
        \`language\` = 'cpp'
        WHERE
        \`id\` = 5 AND
        \`language\` = 'java'
        LIMIT 15`
      )
    );
  });

  // TODO: This test fails, find root cause and correct
  it('Checks error is thrown by constructSqlUpdate when update param is empty', () => {
    expect(() => constructSqlUpdate(Table.Problem, {}, {}, {})).toThrow(
      'Empty update parameter, cannot compile UPDATE'
    );
  });
});

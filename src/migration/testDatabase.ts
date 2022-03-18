/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';
import { ProblemOrm } from './problem.orm';

const INSERT_DATA = false;

const insertModules = async (connection: Connection) => {
  console.log('Inserting into Module. . .');
  connection.query(
    `
    INSERT INTO Module (name, number) VALUES
      ('Test Module One', 1.0),
      ('Test Module Two', 1.1)
    `,
    function (err) {
      if (err) throw err;
    }
  );
};

const selectModules = async (connection: Connection) => {
  console.log('Selecting from Module. . .');
  connection.query(
    'SELECT * FROM Module; -- this is a comment',
    function (err, rows) {
      if (err) {
        throw err;
      } else {
        console.log(`Module Rows:\n${JSON.stringify(rows)}`);
      }
    }
  );
};

const insertProblems = async (connection: Connection) => {
  console.log('Inserting into Problem. . .');
  connection.query(
    `
    INSERT INTO Problem 
      (statement, title, hidden, language, due_date, file_extension,
       template_package, time_limit, memory_limit, build_command,
       module_id)
    SELECT
      'test statement 1',
      'test title 1',
      FALSE,
      'cpp',
      DATE('2022-12-31 01:00:00'),
      '.cpp',
      'test template_package 1',
      1.00,
      1.00,
      'test build_command 1',
      Module.id
    FROM Module
    WHERE name = 'Test Module One'
    LIMIT 1
    `,
    function (err) {
      if (err) throw err;
    }
  );
  connection.query(
    `
    INSERT INTO Problem 
      (statement, title, hidden, language, due_date, file_extension,
       template_package, time_limit, memory_limit, build_command,
       module_id)
    SELECT
      'test statement 2',
      'test title 2',
      FALSE,
      'cpp',
      DATE('2022-12-31 01:00:00'),
      '.cpp',
      'test template_package 2',
      1.00,
      1.00,
      'test build_command 2',
      Module.id
    FROM Module
    WHERE name = 'Test Module One'
    LIMIT 1
    `,
    function (err) {
      if (err) throw err;
    }
  );
  connection.query(
    `
    INSERT INTO Problem 
      (statement, title, hidden, language, due_date, file_extension,
       template_package, time_limit, memory_limit, build_command,
       module_id)
    SELECT
      'test statement 3',
      'test title 3',
      FALSE,
      'cpp',
      DATE('2022-12-31 01:00:00'),
      '.cpp',
      'test template_package 3',
      1.00,
      1.00,
      'test build_command 3',
      Module.id
    FROM Module
    WHERE name = 'Test Module One'
    LIMIT 1
    `,
    function (err) {
      if (err) throw err;
    }
  );
};

const selectProblems = async (problem: ProblemOrm) => {
  console.log('Accessing from Problem using ORM. . .');
  const result = await problem.findAll();
  if (!result) {
    // eslint-disable-next-line no-console
    console.log('Result is empty!');
  } else {
    // eslint-disable-next-line no-console
    console.log(`ORM Result:\n${JSON.stringify(result)}`);
  }
};

const deleteProblems = async (connection: Connection) => {
  console.log('Deleting from Problem. . .');
  connection.query(
    `DELETE FROM Problem WHERE 
      title='test title 1' OR
      title='test title 2' OR
      title='test title 3'
    `,
    function (err) {
      if (err) throw err;
    }
  );
};

const deleteModules = async (connection: Connection) => {
  console.log('Deleting from Module. . .');
  connection.query(
    `DELETE FROM Module WHERE name='Test Module One' OR name='Test Module Two'`,
    function (err) {
      if (err) throw err;
    }
  );
};

const runTest = async (): Promise<void> => {
  const connection: Connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.connect(function (err) {
    if (err) throw err;
  });

  if (INSERT_DATA) {
    await insertModules(connection);
    await insertProblems(connection);
  }
  await selectModules(connection);
  const problem = new ProblemOrm(connection);
  await selectProblems(problem);
  await deleteProblems(connection);
  await deleteModules(connection);

  connection.end(function (err) {
    if (err) throw err;
  });
};

runTest();

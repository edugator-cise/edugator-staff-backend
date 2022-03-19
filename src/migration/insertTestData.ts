/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';

export const insertModules = async (connection: Connection): Promise<void> => {
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

export const insertProblems = async (connection: Connection): Promise<void> => {
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

export const insertData = async (connection: Connection): Promise<void> => {
  await insertModules(connection);
  await insertProblems(connection);
};

const runScript = async (): Promise<void> => {
  console.log('Executing insert script');

  const connection: Connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.connect(function (err) {
    if (err) throw err;
  });

  await insertData(connection);

  connection.end(function (err) {
    if (err) throw err;
  });
};

if (require.main === module) {
  runScript();
}

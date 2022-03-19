/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';
import { ModuleInterface } from '../api/models/module.model';

export const insertModules = async (
  modules: ModuleInterface[],
  connection: Connection
): Promise<void> => {
  console.log('Inserting into Module. . .');
  for (const module of modules) {
    connection.query(
      `
      INSERT INTO Module (name, number) VALUES
        (?, ?)
      `,
      [module.name, module.number],
      function (err) {
        if (err) throw err;
      }
    );
  }
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

interface CodeInterface {
  header: string;
  body: string;
  footer: string;
  problemTitle: string; // Used to lookup fk to Problem
}

export const insertCode = async (
  codes: CodeInterface[],
  connection: Connection
): Promise<void> => {
  console.log('Inserting into Code. . .');
  for (const code of codes) {
    connection.query(
      `
      INSERT INTO Code
        (header, body, footer, problem_id)
      SELECT
        ?,
        ?,
        ?,
        Problem.id
      FROM Problem
      WHERE Problem.title = ?
      LIMIT 1
      `,
      [code.header, code.body, code.footer, code.problemTitle],
      function (err) {
        if (err) throw err;
      }
    );
  }

};

export const insertData = async (connection: Connection): Promise<void> => {
  await insertModules(
    [
      { name: 'Test Module One', number: 1.0, problems: undefined },
      { name: 'Test Module Two', number: 1.1, problems: undefined }
    ],
    connection
  );
  await insertProblems(connection);
  await insertCode(
    [
      {
        header: 'test header 1',
        body: 'test body 1',
        footer: 'test footer 1',
        problemTitle: 'test title 1'
      },
      {
        header: 'test header 2',
        body: 'test body 2',
        footer: 'test footer 2',
        problemTitle: 'test title 2'
      },
      {
        header: 'test header 3',
        body: 'test body 3',
        footer: 'test footer 3',
        problemTitle: 'test title 3'
      }
    ],
    connection
  );
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

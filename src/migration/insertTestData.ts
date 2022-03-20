/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';
import { ModuleInterface } from '../api/models/module.model';
import { ProblemInterface, TestCase } from '../api/models/problem.model';

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

interface ProblemInsertInterface {
  problem: ProblemInterface;
  moduleName: string; // Used to lookup fk to Module
}

export const insertProblems = async (
  problems: ProblemInsertInterface[],
  connection: Connection
): Promise<void> => {
  console.log('Inserting into Problem. . .');
  for (const val of problems) {
    connection.query(
      `
      INSERT INTO Problem 
        (statement, title, hidden, language, due_date, file_extension,
          template_package, time_limit, memory_limit, build_command,
          module_id)
      SELECT
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        Module.id
      FROM Module
      WHERE name = ?
      LIMIT 1
      `,
      [
        val.problem.statement,
        val.problem.title,
        val.problem.hidden,
        val.problem.language,
        val.problem.dueDate,
        val.problem.fileExtension,
        val.problem.templatePackage,
        val.problem.timeLimit,
        val.problem.memoryLimit,
        val.problem.buildCommand,
        val.moduleName
      ],
      function (err) {
        if (err) throw err;
      }
    );
  }
};

interface CodeInsertInterface {
  header: string;
  body: string;
  footer: string;
  problemTitle: string; // Used to lookup fk to Problem
}

export const insertCode = async (
  codes: CodeInsertInterface[],
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

interface TestCaseInsertInterface {
  testCase: TestCase;
  problemTitle: string; // Used to lookup fk to Problem
}

export const insertTestCases = async (
  testCases: TestCaseInsertInterface[],
  connection: Connection
): Promise<void> => {
  console.log('Inserting into TestCase. . .');
  for (const val of testCases) {
    connection.query(
      `
      INSERT INTO TestCase
        (input, expected_output, hint, visibility, problem_id)
      SELECT
        ?,
        ?,
        ?,
        ?,
        Problem.id
      FROM Problem
      WHERE Problem.title = ?
      LIMIT 1
      `,
      [
        val.testCase.input,
        val.testCase.expectedOutput,
        val.testCase.hint,
        val.testCase.visibility,
        val.problemTitle
      ],
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
  await insertProblems(
    [
      {
        problem: {
          statement: 'test statement 1',
          title: 'test title 1',
          hidden: false,
          language: 'cpp',
          dueDate: new Date('2022-12-31T01:00:00'),
          code: undefined,
          fileExtension: '.cpp',
          testCases: [],
          templatePackage: 'test template_package 1',
          timeLimit: 1.0,
          memoryLimit: 1.0,
          buildCommand: 'test build_command 1'
        },
        moduleName: 'Test Module One'
      },
      {
        problem: {
          statement: 'test statement 2',
          title: 'test title 2',
          hidden: false,
          language: 'cpp',
          dueDate: new Date('2022-12-31T01:00:00'),
          code: undefined,
          fileExtension: '.cpp',
          testCases: [],
          templatePackage: 'test template_package 2',
          timeLimit: 1.0,
          memoryLimit: 1.0,
          buildCommand: 'test build_command 2'
        },
        moduleName: 'Test Module One'
      },
      {
        problem: {
          statement: 'test statement 3',
          title: 'test title 3',
          hidden: false,
          language: 'cpp',
          dueDate: new Date('2022-12-31T01:00:00'),
          code: undefined,
          fileExtension: '.cpp',
          testCases: [],
          templatePackage: 'test template_package 3',
          timeLimit: 1.0,
          memoryLimit: 1.0,
          buildCommand: 'test build_command 3'
        },
        moduleName: 'Test Module One'
      }
    ],
    connection
  );
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
  await insertTestCases(
    [
      {
        testCase: {
          input: 'test input 1',
          expectedOutput: 'test expected output 1',
          hint: 'test hint 1',
          visibility: 0
        },
        problemTitle: 'test title 1'
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

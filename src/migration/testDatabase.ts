/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';
import { ProblemOrm, ProblemUpdate } from './problem.orm';
import { clearTestData, insertTestData } from './insertTestData';
import { ProblemDocument } from './problem.orm';

const INSERT_DATA = true;
const TEAR_DOWN = true;

const selectModules = async (connection: Connection) => {
  console.log('Selecting from Module. . .');
  connection.query(
    'SELECT * FROM Module; -- this is a comment',
    function (err, rows) {
      if (err) {
        throw err;
      } else {
        console.log(`Module Rows:\n${JSON.stringify(rows, null, 2)}`);
      }
    }
  );
};

const updateProblem = async (problem: ProblemOrm) => {
  const initial = await problem.findOne({ title: 'Test Title 2' });
  const expected: ProblemUpdate = {
    title: 'Updated Test Title 2',
    statement: 'Updated Statement 2',
    hidden: initial.hidden,
    language: 'java',
    dueDate: initial.dueDate,
    code: {
      header: initial.code.header,
      body: initial.code.body,
      footer: 'updated footer'
    },
    fileExtension: initial.fileExtension,
    testCases: [
      {
        input: 'updated input',
        expectedOutput: 'updated expected output',
        hint: 'updated hint',
        visibility: 1
      }
    ],
    templatePackage: initial.templatePackage,
    timeLimit: initial.timeLimit,
    memoryLimit: initial.memoryLimit,
    buildCommand: initial.buildCommand
  };
  const result = await problem.findByIdAndUpdate(initial._id, expected, {
    new: true
  });

  let success = true;
  for (const key in expected) {
    if (JSON.stringify(result[key]) != JSON.stringify(expected[key])) {
      success = false;
      break;
    }
  }
  console.log(
    `ProblemOrm.findByIdAndUpdate Test: ${success ? 'success' : 'failure'}`
  );
  if (!success) {
    console.log(
      `Expected:
      ${JSON.stringify(expected, null, 2)}
      Received:
      ${JSON.stringify(result, null, 2)}
      `
    );
  }
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
    await insertTestData(connection);
  }
  await selectModules(connection);
  const problem = new ProblemOrm(connection);
  await updateProblem(problem);
  if (TEAR_DOWN) {
    await clearTestData(connection);
  }

  connection.end(function (err) {
    if (err) throw err;
  });
};

runTest();

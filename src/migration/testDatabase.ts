/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';
import { ProblemOrm } from './problem.orm';
import { insertModules, insertProblems } from './insertTestData';

const INSERT_DATA = true;

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

const selectProblems = async (problem: ProblemOrm) => {
  console.log('Accessing from Problem using ORM. . .');
  const result = await problem.findAll();
  if (!result) {
    // eslint-disable-next-line no-console
    console.log('Result is empty!');
  } else {
    // eslint-disable-next-line no-console
    console.log(`ORM Result:\n${JSON.stringify(result, null, 2)}`);
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

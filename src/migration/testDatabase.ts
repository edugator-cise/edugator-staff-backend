/* eslint-disable no-console */
import { createConnection, Connection } from 'mysql2';
import { ProblemOrm } from './problem.orm';
import { insertTestData } from './insertTestData';
import { ProblemDocument } from './problem.orm';
import { Table, constructSqlSelect, constructSqlUpdate } from './query';

const INSERT_DATA = false;
const TEAR_DOWN = false;

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
  const printResult = (funcName: string, result: ProblemDocument[]) => {
    if (!result) {
      // eslint-disable-next-line no-console
      console.log(`ProblemORM.${funcName}: Result is empty!`);
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `ProblemORM.${funcName}:\n${JSON.stringify(result, null, 2)}`
      );
    }
  };
  console.log('Accessing from Problem using ORM. . .');
  let result = await problem.findAll();
  printResult('findAll()', result);
  result = await problem.find({ title: 'Test Title 1' });
  printResult("find({ title: 'Test Title 1' })", result);
  result = await problem.find({
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
  });
  printResult(
    `find({
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
    })`,
    result
  );
  result = await problem.find({ title: null });
  printResult('find({ title: null })', result);
  const printSingleDocument = (func: string, doc: ProblemDocument) => {
    console.log(`${func}:\n${JSON.stringify(doc, null, 2)}`);
  };
  let res: ProblemDocument = await problem.findOne({ language: 'cpp' });
  printSingleDocument("problem.findOne({ language: 'cpp' })", res);
  res = await problem.findOne({ language: 'thisIsNotALanguage' });
  printSingleDocument(
    "problem.findOne({ language: 'thisIsNotALanguage' })",
    res
  );
  res = await problem.findOne({ title: 'Test Title 1' });
  const resById: ProblemDocument = await problem.findById(res._id);
  console.log(
    `findById test: ${
      JSON.stringify(res) === JSON.stringify(resById) ? 'success' : 'fail'
    }`
  );
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

const testConstructSQLQuery = () => {
  console.log(
    constructSqlSelect(
      Table.Problem,
      {
        title: 'Test Title 1',
        language: 'cpp',
        timeLimit: 1
      },
      {}
    )
  );
  console.log(constructSqlSelect(Table.Problem, {}, {}));
  console.log(
    constructSqlSelect(
      Table.Problem,
      {
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
      { limit: 0 }
    )
  );
  console.log(constructSqlSelect(Table.Problem, { title: null }, {}));
  console.log(
    constructSqlSelect(Table.Problem, { language: 'cpp' }, { limit: 5 })
  );
  console.log(
    constructSqlUpdate(Table.Problem, { _id: 5 }, { language: 'java' }, {})
  );
  console.log(
    constructSqlUpdate(
      Table.Problem,
      { title: 'SampleTitle', language: 'cpp' },
      { language: 'java' },
      { limit: 15 }
    )
  );
  console.log(
    constructSqlUpdate(
      Table.Problem,
      { title: 'SampleTitle', language: 'cpp' },
      { language: 'java' },
      { limit: null }
    )
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

  testConstructSQLQuery();
  if (INSERT_DATA) {
    await insertTestData(connection);
  }
  await selectModules(connection);
  const problem = new ProblemOrm(connection);
  await selectProblems(problem);
  if (TEAR_DOWN) {
    await deleteProblems(connection);
    await deleteModules(connection);
  }

  connection.end(function (err) {
    if (err) throw err;
  });
};

runTest();

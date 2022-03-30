/* eslint-disable no-console */
import { connect } from '../config/database';
import { createConnection, Connection } from 'mysql2';
import { Module, ModuleInterface } from '../api/models/module.model';
import {
  mySQLCode,
  mySQLModule,
  mySQLProblem,
  mySQLTestCase,
  mySQLUser
} from './mySQLTypes';
import { Types } from 'mongoose';
import { Problem, ProblemInterface } from '../api/models/problem.model';
import { IUser, UserModel } from '../api/models/user.model';

// await this function inside another async in order to access the data.
const getModuleData = async (): Promise<ModuleInterface[]> => {
  return await Module.find().sort({ number: 1 });
};

// await this function inside another async in order to access the data.
const getProblemData = async (): Promise<ProblemInterface[]> => {
  return await Problem.find({});
};

// await this function inside another async in order to access the data.
const getUserData = async (): Promise<IUser[]> => {
  return await UserModel.find();
};

// For storing the data to inject into mySQL
const mySQLModuleArray: mySQLModule[] = [];
const mySQLProblemArray: mySQLProblem[] = [];
const mySQLCodeArray: mySQLCode[] = [];
const mySQLTestCaseArray: mySQLTestCase[] = [];
const mySQLUserArray: mySQLUser[] = [];

const transformData = async () => {
  // connect to the mongo instance.
  connect();

  //get all data
  const mongoModulesArray: ModuleInterface[] = await getModuleData();
  const mongoProblemsArray: ProblemInterface[] = await getProblemData();
  const mongoUserArray: IUser[] = await getUserData();

  // Counters for ids for mySQL data
  let moduleCounter = 1;
  let problemCounter = 1;
  let codeCounter = 1;
  let testCounter = 1;
  let userCounter = 1;

  // will be used to map ProblemObjectID and Module(number)
  const mapModuleProblems: Map<number, Types.ObjectId[]> = new Map<
    number,
    Types.ObjectId[]
  >();

  // Iterate over the modules
  for (const mongoModule of mongoModulesArray) {
    const mySQLModule: mySQLModule = {
      id: moduleCounter,
      name: mongoModule.name,
      number: mongoModule.number
    };
    mySQLModuleArray.push(mySQLModule);

    const x: Types.ObjectId[] = [];

    mongoModule.problems.forEach((value: Types.ObjectId) => {
      x.push(value);
    });

    mapModuleProblems.set(moduleCounter, x);
    moduleCounter++;
  }

  let moduleMatch = -1;

  // Now, we must determine what problems are associated with
  for (const mongoProblem of mongoProblemsArray) {
    // we need to first determine the module this problem maps to

    // let's find the associated module here - reverse lookup time.

    for (const [key, value] of mapModuleProblems.entries()) {
      for (const potentialID of value) {
        const potentialProblem: ProblemInterface = await Problem.findById(
          potentialID
        );

        if (
          potentialProblem != null &&
          potentialProblem.title == mongoProblem.title
        ) {
          // this is a match
          moduleMatch = key;
        }
      }
    }

    const mySQLProblem: mySQLProblem = {
      id: problemCounter,
      statement: mongoProblem.statement,
      title: mongoProblem.title,
      hidden: mongoProblem.hidden,
      language: mongoProblem.language,
      due_date: mongoProblem.dueDate,
      file_extension: mongoProblem.fileExtension,
      template_package: mongoProblem.templatePackage,
      time_limit: mongoProblem.timeLimit,
      memory_limit: mongoProblem.memoryLimit,
      build_command: mongoProblem.buildCommand,
      module_id: moduleMatch
    };
    mySQLProblemArray.push(mySQLProblem);
    console.log('MYSQLProblemModuleID: ' + mySQLProblem.module_id);

    const mySQLCode: mySQLCode = {
      id: codeCounter,
      header: mongoProblem.code.header,
      body: mongoProblem.code.body,
      footer: mongoProblem.code.footer,
      problem_id: problemCounter // this should be fine since it's from this problem
    };

    //push here
    mySQLCodeArray.push(mySQLCode);
    codeCounter++;

    for (const mongoTestCase of mongoProblem.testCases) {
      const mySQLTestCase: mySQLTestCase = {
        id: testCounter,
        input: mongoTestCase.input,
        expected_output: mongoTestCase.expectedOutput,
        hint: mongoTestCase.hint,
        visibility: mongoTestCase.visibility,
        problem_id: problemCounter
      };

      //push here
      mySQLTestCaseArray.push(mySQLTestCase);
      testCounter++;
    }
    problemCounter++;
  }

  for (const mongoUser of mongoUserArray) {
    const mySQLUser: mySQLUser = {
      id: userCounter,
      username: mongoUser.username,
      password: mongoUser.password,
      salt: 1, // need to correct this
      role: mongoUser.role
    };

    mySQLUserArray.push(mySQLUser);
    userCounter++;
  }
};

const runMigration = async (): Promise<void> => {
  await transformData();

  console.log('transform done');

  const connection: Connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  //connect to the MySQL Database
  connection.connect();

  console.log('connected');

  connection.query('USE test_db', function (err) {
    if (err) throw err;
  });

  // need to remap for how SQL expects the values
  const mySQLModuleArrayValues: any[][] = mySQLModuleArray.map((obj) =>
    Object.values(obj)
  );
  const mySQLProblemArrayValues: any[][] = mySQLProblemArray.map((obj) =>
    Object.values(obj)
  );
  const mySQLCodeArrayValues: any[][] = mySQLCodeArray.map((obj) =>
    Object.values(obj)
  );
  const mySQLTestCaseArrayValues: any[][] = mySQLTestCaseArray.map((obj) =>
    Object.values(obj)
  );
  const mySQLUserArrayValues: any[][] = mySQLUserArray.map((obj) =>
    Object.values(obj)
  );

  for (const mySQLModuleArrayValue of mySQLModuleArrayValues) {
    console.log(mySQLModuleArrayValue);

    connection.query(
      'INSERT INTO Module (id, name, number) VALUES (?)',
      [mySQLModuleArrayValue],
      function (err) {
        if (err) throw err;
      }
    );
    console.log('inserted module');
  }

  console.log(mySQLProblemArrayValues);

  for (const mySQLProblemArrayValue of mySQLProblemArrayValues) {
    connection.query(
      'INSERT INTO Problem (id, statement, title, hidden, language, due_date, file_extension, template_package, time_limit, memory_limit, build_command, module_id) VALUES (?)',
      [mySQLProblemArrayValue],
      function (err) {
        if (err) throw err;
      }
    );
    console.log('inserted problem');
  }

  for (const mySQLCodeArrayValue of mySQLCodeArrayValues) {
    connection.query(
      'INSERT INTO Code (id, header, body, footer, problem_id) VALUES (?)',
      [mySQLCodeArrayValue],
      function (err) {
        if (err) throw err;
      }
    );
    console.log('inserted code');
  }

  for (const mySQLTestCaseArrayValue of mySQLTestCaseArrayValues) {
    connection.query(
      'INSERT INTO TestCase (id, input, expected_output, hint, visibility, problem_id) VALUES (?)',
      [mySQLTestCaseArrayValue],
      function (err) {
        if (err) throw err;
      }
    );
    console.log('inserted testcase');
  }

  for (const mySQLUserArrayValue of mySQLUserArrayValues) {
    connection.query(
      'INSERT INTO User (id, username, password, salt, role) VALUES (?)',
      [mySQLUserArrayValue],
      function (err) {
        if (err) throw err;
      }
    );
    console.log('inserted User');
  }

  connection.end();
};

runMigration();

// for logging/data exploration
const logModules = async () => {
  const modulesArray: ModuleInterface[] = await getModuleData();
  for (const module of modulesArray) {
    console.log(module);
  }

  console.log(modulesArray.length);
};

// for logging/data exploration
const logProblems = async () => {
  const problemsArray: ProblemInterface[] = await getProblemData();
  for (const problem of problemsArray) {
    console.log(problem);
  }

  console.log(problemsArray.length);
};

// logging
logModules();
logProblems();

import { connect, disconnect } from '../config/database';
import { createConnection, Connection } from 'mysql2';
import { Module, ModuleInterface } from '../api/models/module.model';
import {
  mySQLCode,
  mySQLModule, mySQLProblem, mySQLTestCase
} from './mySQLTypes';
import { Types } from 'mongoose';

// await this function inside another async in order to access the data.
const getModuleData = async (): Promise<ModuleInterface[]> => {
  let modules: ModuleInterface[];
  modules = await Module.find().sort({ number: 1 }); // what is this really doing, why select like this?

  return modules;
};

// await this function inside another async in order to access the data.
const getProblemData = async (): Promise<ProblemInterface[]> => {
  let problems: ProblemInterface[];
  problems = await Problem.find({});

  return problems;
};

// connect to the mongo instance.
connect();

const transformData = async () => {

  let mySQLModuleArray: mySQLModule[] = [];
  let mySQLProblemArray: mySQLProblem[] = [];
  let mySQLCodeArray: mySQLCode[] = [];
  let mySQLTestCaseArray: mySQLTestCase[] = [];

  const mongoModulesArray = await getModuleData();
  const mongoProblemsArray = await getProblemData();

  // TODO: here, parse out all of the data from mongo and insert accordingly into the new mySQL Arrays

  // We can parse the modules out - need to keep track of the problems associated with a module.
  // Those will be inserted into the problems table along with FKs to

  // need to make a hash map that keeps track of the problem ObjectIDs that are associated with each module

  let moduleCounter = 1;
  let problemCounter = 1;
  let codeCounter = 1;
  let testCounter = 1;

  // will map moduleID to problems
  let mapModuleProblems: Map<number, Types.ObjectId[]> = new Map<
    number,
    Types.ObjectId[]
  >();

  for (const mongoModule of mongoModulesArray) {
    const mySQLModule: mySQLModule = {
      id: moduleCounter,
      name: mongoModule.name,
      number: mongoModule.number
    };

    mySQLModuleArray.push(mySQLModule);

    let x: Types.ObjectId[] = [];

    mongoModule.problems.forEach((value: Types.ObjectId) => {
      x.push(value._id);
    });

    mapModuleProblems.set(moduleCounter, x);
    moduleCounter++;
  }

  let moduleMatch = -1;

  // TODO: Work more on FK stuff
  for (const mongoProblem of mongoProblemsArray) {
    // we need to first determine the module this problem maps to

    // let's find the associated module here - reverse lookup time.


    mapModuleProblems.forEach(async (value: Types.ObjectId[], key: number) => {
      // now we can see if any of the objectIds match for this module

      for (const potentialID of value) {
        const potentialProblem: ProblemInterface = await Problem.findById(
          potentialID
        );

        if (potentialProblem.title == mongoProblem.title) {
          // this is a match
          moduleMatch = key;
        }
      }
    });

    console.log(moduleMatch);

    const mySQLProblem: mySQLProblem = {
      id: problemCounter,
      statement: mongoProblem.statement,
      title: mongoProblem.title,
      hidden: mongoProblem.hidden,
      language: mongoProblem.language,
      due_date: mongoProblem.dueDate.toDateString(), // is this format fine?
      file_extension: mongoProblem.fileExtension,
      template_package: mongoProblem.templatePackage,
      time_limit: mongoProblem.timeLimit,
      memory_limit: mongoProblem.memoryLimit,
      build_command: mongoProblem.buildCommand,
      module_id: moduleMatch
    };
    mySQLProblemArray.push(mySQLProblem);

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
        problem_id: problemCounter // this should be fine since it's from this problem
      };

      //push here
      mySQLTestCaseArray.push(mySQLTestCase);
      testCounter++;

      problemCounter++; // this the ideal location?
    }

    // similar to before with a module containing problems, a problem now contains both
    // test cases AND code. There is a 1:1 mapping for code but a 1:many for testcases.
  }

  const connection: Connection = createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  //connect to the MySQL Database
  connection.connect();

  connection.query('USE test_db', function (err) {
    if (err) throw err;
  });

  // need to remap for how SQL expects the values
  const mySQLModuleArrayValues: any[][] = mySQLModuleArray.map((obj) =>
    Object.values(obj)
  );
  // const mySQLProblemArrayValues: any[][] = mySQLProblemArray.map((obj) =>
  //   Object.values(obj)
  // );
  // const mySQLCodeArrayValues: any[][] = mySQLCodeArray.map((obj) =>
  //   Object.values(obj)
  // );
  // const mySQLTestCaseArrayValues: any[][] = mySQLTestCaseArray.map((obj) =>
  //   Object.values(obj)
  // );

  // TODO: we should then insert all of this data into the mysql database.
  console.log(mySQLModuleArrayValues);

  for (const mySQLModuleArrayValue of mySQLModuleArrayValues) {
    console.log(mySQLModuleArrayValue);

    connection.query(
      'INSERT INTO Module (id,name,number) VALUES (?)',
      [mySQLModuleArrayValue],
      function (err) {
        if (err) throw err;
      }
    );
  }
  disconnect();
  connection.end();

};

transformData();


// // Insert Modules, then Problem, then TestCase, then Code

// //connection.query('INSERT INTO Module () VALUES ?');

// // for logging/data exploration
// const logModules = async () => {
//   const modulesArray: ModuleInterface[] = await modulesPromise;
//   for (const module of modulesArray) {
//     console.log(module);
//   }

//   console.log(modulesArray.length);
// };

// // for logging/data exploration
// const logProblems = async () => {
//   const problemsArray: ProblemInterface[] = await problemsPromise;
//   for (const problem of problemsArray) {
//     console.log(problem);
//   }

//   console.log(problemsArray.length);
// };

// // logging
// logModules();
// logProblems();

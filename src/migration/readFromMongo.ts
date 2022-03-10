import { connect } from '../config/database';
import { createConnection, Connection } from 'mysql2';
import {
  Module,
  ModuleDocument,
  ModuleInterface
} from '../api/models/module.model';
import {
  Problem,
  ProblemDocument,
  ProblemInterface
} from '../api/models/problem.model';
import {
  mySQLCode,
  mySQLModule,
  mySQLProblem,
  mySQLTestCase
} from './mySQLTypes';
import { ObjectId, Types } from 'mongoose';

// await this function inside another async in order to access the data.
const getModuleData = async (): Promise<ModuleInterface[]> => {
  let modules: ModuleInterface[];
  modules = await Module.find().select('-problems').sort({ number: 1 }); // what is this really doing, why select like this?

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

const modulesPromise: Promise<ModuleInterface[]> = getModuleData();
const problemsPromise: Promise<ProblemInterface[]> = getProblemData();

let mySQLModuleArray: mySQLModule[];
let mySQLProblemArray: mySQLProblem[];
let mySQLCodeArray: mySQLCode[];
let mySQLTestCaseArray: mySQLTestCase[];

const transformData = async () => {
  const mongoModulesArray = await modulesPromise;
  const mongoProblemsArray = await problemsPromise;

  // TODO: here, parse out all of the data from mongo and insert accordingly into the new mySQL Arrays

  // We can parse the modules out - need to keep track of the problems associated with a module.
  // Those will be inserted into the problems table along with FKs to

  // need to make a hash map that keeps track of the problem ObjectIDs that are associated with each module

  let moduleCounter = 0;
  let problemCounter = 0;
  let codeCounter = 0;
  let testCounter = 0;

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

    //TODO: Deal with mapping to problems
    // we can use this to do a reverse lookup
    for (const mongoProblem of mongoModule.problems) {
      x.push(mongoProblem._id);
    }

    // let x: Types.ObjectId[] = mongoModule.problems.map(obj => Object.values(obj));
    mapModuleProblems.set(moduleCounter, x);
    moduleCounter++;
  }

  for (const mongoProblem of mongoProblemsArray) {
    // we need to first determine the module this problem maps to

    // let's find the associated module here - reverse lookup time.

    let moduleMatch = -1;

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
};

const connection: Connection = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

//connect to the MySQL Database
connection.connect();

// need to remap for how SQL expects the values
let mySQLModuleArrayValues: any[][] = mySQLModuleArray.map((obj) =>
  Object.values(obj)
);
let mySQLProblemArrayValues: any[][] = mySQLProblemArray.map((obj) =>
  Object.values(obj)
);
let mySQLCodeArrayValues: any[][] = mySQLCodeArray.map((obj) =>
  Object.values(obj)
);
let mySQLTestCaseArrayValues: any[][] = mySQLTestCaseArray.map((obj) =>
  Object.values(obj)
);

// TODO: we should then insert all of this data into the mysql database.

connection.query('INSERT INTO Module VALUES ?', [mySQLModuleArrayValues]);

// Insert Modules, then Problem, then TestCase, then Code

connection.query('INSERT INTO Module () VALUES ?');

// for logging/data exploration
const logModules = async () => {
  const modulesArray: ModuleInterface[] = await modulesPromise;
  for (const module of modulesArray) {
    console.log(module);
  }

  console.log(modulesArray.length);
};

// for logging/data exploration
const logProblems = async () => {
  const problemsArray: ProblemInterface[] = await problemsPromise;
  for (const problem of problemsArray) {
    console.log(problem);
  }

  console.log(problemsArray.length);
};

// logging
logModules();
logProblems();

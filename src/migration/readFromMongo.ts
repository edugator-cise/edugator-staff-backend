import { connect } from '../config/database';
import { Module, ModuleInterface } from '../api/models/module.model';
import { Problem, ProblemInterface } from '../api/models/problem.model';
import {
  mySQLCode,
  mySQLModule,
  mySQLProblem,
  mySQLTestCase
} from './mySQLTypes';

// await this function inside another async in order to access the data.
const getModuleData = async (): Promise<ModuleInterface[]> => {
  let modules: ModuleInterface[];
  modules = await Module.find().select('-problems').sort({ number: 1 });

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

  for (const mongoModule of mongoModulesArray) {
    const mySQLModule: mySQLModule = {
      id: 0,
      name: mongoModule.name,
      number: mongoModule.number
    };
    mySQLModuleArray.push(mySQLModule);

    // we need to take note of which problems are associated here.
    // perhaps map the name (or id) to the problems associated.
    
    //TODO: Deal with mapping to problems
  }

  for (const mongoProblem of mongoProblemsArray) {
    const mySQLProblem: mySQLProblem = {
      id: 0,
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
      module_id: ???
    }
    mySQLProblemArray.push(mySQLProblem);

    const mySQLCode: mySQLCode = {
      id: 0,
      header: mongoProblem.code.header,
      body: mongoProblem.code.body,
      footer: mongoProblem.code.footer,
      problem_id: ???
    }
    //push here

    for (const mongoTestCase of mongoProblem.testCases) {
      const mySQLTestCase: mySQLTestCase = {
        id: 0,
        input: mongoTestCase.input,
        expected_output: mongoTestCase.expectedOutput,
        hint: mongoTestCase.hint,
        visibility: mongoTestCase.visibility,
        problem_id: ???
      }

      //push here

    }

    // similar to before with a module containing problems, a problem now contains both 
    // test cases AND code. There is a 1:1 mapping for code but a 1:many for testcases.

  }



};

// TODO: we should then insert all of this data into the mysql database.

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

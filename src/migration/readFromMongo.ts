import { connect } from '../config/database';
import { Module, ModuleInterface } from '../api/models/module.model';
// import { Problem, ProblemInterface } from '../api/models/problem.model';
// import {
//   mySQLCode,
//   mySQLModule,
//   mySQLProblem,
//   mySQLTestCase
// } from './mySQLTypes';

// await this function inside another async in order to access the data.
const getModuleData = async (): Promise<ModuleInterface[]> => {
  let modules: ModuleInterface[];
  modules = await Module.find().select('-problems').sort({ number: 1 });

  return modules;
};

// await this function inside another async in order to access the data.
// const getProblemData = async (): Promise<ProblemInterface[]> => {
//   let problems: ProblemInterface[];
//   problems = await Problem.find({});

//   return problems;
// };

// connect to the mongo instance.
connect();

const modulesPromise: Promise<ModuleInterface[]> = getModuleData();
// const problemsPromise: Promise<ProblemInterface[]> = getProblemData();

// let mySQLModuleArray: mySQLModule[];
// let mySQLProblemArray: mySQLProblem[];
// let mySQLCodeArray: mySQLCode[];
// let mySQLTestCaseArray: mySQLTestCase[];

// const transformData = async () => {
//   const mongoModulesArray = await modulesPromise;
//   const mongoProblemsArray = await problemsPromise;

//   // TODO: here, parse out all of the data from mongo and insert accordingly into the new mySQL Arrays

//   // We can parse the modules out - need to keep track of the problems associated with a module.
//   // Those will be inserted into the problems table along with FKs to modules.
// };

// TODO: we should then insert all of this data into the mysql database.

// for logging/data exploration
const logModules = async () => {
  const modulesArray: ModuleInterface[] = await modulesPromise;
  for (const module of modulesArray) {
    console.log(module);
  }

  console.log(modulesArray.length);
};

// // for logging/data exploration
// const logProblems = async () => {
//   const problemsArray: ProblemInterface[] = await problemsPromise;
//   for (const problem of problemsArray) {
//     console.log(problem);
//   }

//   console.log(problemsArray.length);
// };

// logging
logModules();
// logProblems();

import { connect } from '../config/database';
import { Module, ModuleInterface } from '../api/models/module.model';
import { Problem, ProblemInterface } from '../api/models/problem.model';

const getModuleData = async (): Promise<ModuleInterface[]> => {
  let modules: ModuleInterface[];
  modules = await Module.find().select('-problems').sort({ number: 1 });

  return modules;
};

const getProblemData = async (): Promise<ProblemInterface[]> => {
  let problems: ProblemInterface[];
  problems = await Problem.find({});

  return problems;
};



connect();

const modulesPromise: Promise<ModuleInterface[]> = getModuleData();
const problemsPromise: Promise<ProblemInterface[]> = getProblemData();

const logModules = async () => {
  const modulesArray: ModuleInterface[] = await modulesPromise;
  for (const module of modulesArray) {
    console.log(module);
  }

  console.log(modulesArray.length);
};

const logProblems = async () => {
  const problemsArray: ProblemInterface[] = await problemsPromise;
  for (const problem of problemsArray) {
    console.log(problem);
  }

  console.log(problemsArray.length);
};

logModules();
logProblems();

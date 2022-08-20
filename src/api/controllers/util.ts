import { IModule } from '../models/module.mysql.model';
import { IProblem, Code, TestCase } from '../models/problem.mysql.model';

/*
 * Data types for database records required by the frontend.
 *
 * The frontend expects the primary key of a record to be called
 * "_id" whereas the backend refers it to as "id".
 *
 * Why? Sequelize sometimes does not support primary keys with name "_id"
 * due to on ongoing bug in Sequelize v5 and v6. However, this bug only
 * occurs when the "_id" key is used as a foreign key elsewhere.
 * (This is why "UserTable" can have "_id" as its primary key.)
 * As a workaround, these types and functions are implemented to
 * alias the "id" field to "_id" at runtime.
 */

interface FrontEndIModule {
  id?: number;
  _id: number;
  name: string;
  number: number;
  problems?: FrontEndIProblem[];
}

interface FrontEndIProblem {
  id?: number;
  _id: number;
  statement: string;
  title: string;
  hidden: boolean;
  language: string;
  dueDate: Date;
  fileExtension: string;
  templatePackage: string;
  timeLimit?: number;
  memoryLimit?: number;
  buildCommand?: string;
  moduleId: number;
  code?: Code;
  testCases?: TestCase[];
}

function translateIdOnModule(module: IModule): FrontEndIModule {
  if (module === null) {
    return null;
  }

  // Don't add the problems attribute if not present
  if (module.problems != null) {
    return {
      id: module.id,
      _id: module.id,
      name: module.name,
      number: module.number,
      problems: translateIdOnProblemArray(module.problems)
    };
  } else {
    return {
      id: module.id,
      _id: module.id,
      name: module.name,
      number: module.number
    };
  }
}

function translateIdOnModuleArray(modules: IModule[]): FrontEndIModule[] {
  if (modules === null) {
    return null;
  }
  const newModules: FrontEndIModule[] = [];
  for (const module of modules) {
    newModules.push(translateIdOnModule(module));
  }
  return newModules;
}

function translateIdOnProblem(problem: IProblem): FrontEndIProblem {
  if (problem === null) {
    return null;
  } else {
    return {
      id: problem.id,
      _id: problem.id,
      statement: problem.statement,
      title: problem.title,
      hidden: problem.hidden,
      language: problem.language,
      dueDate: problem.dueDate,
      fileExtension: problem.fileExtension,
      templatePackage: problem.templatePackage,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      buildCommand: problem.buildCommand,
      moduleId: problem.moduleId,
      code: problem.code,
      testCases: problem.testCases
    };
  }
}

function translateIdOnProblemArray(problems: IProblem[]): FrontEndIProblem[] {
  if (problems === null) {
    return null;
  }
  const newProblems: FrontEndIProblem[] = [];
  for (const problem of problems) {
    newProblems.push(translateIdOnProblem(problem));
  }
  return newProblems;
}

export {
  translateIdOnModule,
  translateIdOnModuleArray,
  translateIdOnProblem,
  translateIdOnProblemArray
};

import { IModule } from '../models/module.mysql.model';
// import { IProblem } from '../models/problem.mysql.model';

function translateIdOnModule(module: IModule) {
  return {
    id: module.id,
    _id: module.id,
    name: module.name,
    number: module.number,
    problems: module.problems
  };
}

function translateIdOnModuleArray(modules: IModule[]) {
  const newModules: any[] = [];
  for (const module of modules) {
    newModules.push(translateIdOnModule(module));
  }
  return newModules;
}

// function translateIdOnProblem(problem: IProblem) {
//   // how to do naming? camel or underscores?
//   return {
//     id: problem.id,
//     _id: problem.id,
//     statement: problem.statement,
//     title: problem.title,
//     hidden: problem.hidden,
//     language: problem.language,
//     due_date: problem.dueDate,
//     file_extension: problem.fileExtension,
//     template_package: problem.templatePackage,
//     time_limit: problem.timeLimit,
//     memory_limit: problem.memoryLimit,
//     build_command: problem.buildCommand,
//     module_id: problem.moduleId,
//     code: problem.code,
//     test_cases: problem.testCases
//   };
// }

// function translateIdOnProblemArray(problems: IProblem[]) {
//   const newProblems: any[] = [];
//   for (const problem of problems) {
//     newProblems.push(translateIdOnProblem(problem));
//   }
//   return newProblems;
// }

// started working on this, but we don't even need it I guess? since _id works for user? sorta?
// leaving untill we see more clearly on testing
// function translateIdOnUser(user: IUser) {
// }

// function translateIdOnUserArray(users: IUser[]) {
//   const newUsers: any[] = [];
//   for (const user of users) {
//     newUsers.push(transl)
//   }
// }

// I don't even think this is needed, judge is the only service that calls directly so?
// function translateIdOnCode(code: Code) {
//   return {
//     id: code.
//   };
// }

// Same here - I don't think we need this, do we?
// function translateIdOnTestCase(testCase: TestCase) {
//   return {
//     id: testCase.id
//   };
// }

// function translateIdOnTestCaseArray(testCases: ) {
//   const newTestCases: any[] = [];
//   for (const testCase of testCases) {
//     newTestCases.push(translateIdOnTestCase(testCase));
//   }
//   return newTestCases;
// }

export { translateIdOnModule, translateIdOnModuleArray };

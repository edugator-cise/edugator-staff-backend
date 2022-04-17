import { IModule } from "../models/module.mysql.model";

function translateIdOnModule(module: IModule) {
  return {
    id: module.id,
    _id: module.id,
    name: module.name,
    number: module.number,
    problems: module.problems
  }
}

function translateIdOnModuleArray(modules: IModule[]) {
  let newModules: any[] = []
  for (const module of modules) {
    newModules.push(translateIdOnModule(module));
  }
  return newModules;
}

export { translateIdOnModule };
import { Request, Response } from 'express';
import { ModuleAttributesInput } from '../../models/v2/module.model';
import * as ModuleDataLayer from '../../dal/module';
import * as CourseDataLayer from '../../dal/course';
import * as ProblemDataLayer from '../../dal/problem';
import * as LessonDataLayer from '../../dal/lesson';
import { v4 as uuidv4 } from 'uuid';
import { ProblemAttributes } from '../../models/v2/problem.model';

export const postModule = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  if (!req.body.courseId) return res.status(400).send('missing course id');
  const course = CourseDataLayer.getById(req.body.courseId);
  if (!course) return res.status(400).send('invalid course id');
  try {
    const payload: ModuleAttributesInput = { ...req.body, id: uuidv4() };
    const result = await ModuleDataLayer.create(payload);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const getModules = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const modules = await ModuleDataLayer.getAll();
    if (!modules) res.status(404).send();
    else res.status(200).send(modules);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const getModuleByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  // add validator for moduleId?
  try {
    const module_ = await ModuleDataLayer.getById(req.params.moduleId);
    if (!module_) res.status(404).send();
    else res.status(200).send(module_);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const getModuleByProblemId = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  // validate problemId?
  // if (!isMongoId(req.params.problemId)) {
  //   return res.status(400).send('This route requires a valid problem ID');
  // }
  const problem = await ProblemDataLayer.getById(req.params.problemId);
  if (!problem) return res.status(400).send('invalid problem id');
  try {
    const modules = await ModuleDataLayer.getById(problem.moduleId);
    if (!modules) return res.status(404).send();
    return res.status(200).send(modules);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const putModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await ModuleDataLayer.updateById(
      req.params.moduleId,
      req.body
    );
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const result = await ModuleDataLayer.deleteById(req.params.moduleId);
    const problemResult = await ProblemDataLayer.deleteByModule(
      req.params.moduleId
    );
    const lessonResult = await LessonDataLayer.deleteByModule(
      req.params.moduleId
    );
    return res.status(200).send(result && problemResult && lessonResult);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const changeProblemOrder = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const module_ = await ModuleDataLayer.getById(req.params.moduleId);
    if (!module_ || !module_['problems'])
      return res.status(400).send('Module not found or module is empty');
    if (module_['problems'].length == 1)
      return res
        .status(400)
        .send('Cannot change order of only problem in module');

    const problemIndex = module_['problems']
      .map((problem: ProblemAttributes) => {
        return problem.id;
      })
      .indexOf(req.body.problemId);
    if (problemIndex == -1)
      return res.status(400).send('Problem not found in module');

    if (req.body.direction === 'up') {
      if (problemIndex === 0)
        return res.status(400).send('Problem already at top of module');

      const problemToSwap = module_['problems'][problemIndex - 1];
      module_['problems'][problemIndex - 1] = req.body.problemId;
      module_['problems'][problemIndex] = problemToSwap;
    } else if (req.body.direction === 'down') {
      if (problemIndex == module_['problems'].length - 1)
        return res.status(400).send('Problem already at bottom of module');
      const problemToSwap = module_['problems'][problemIndex + 1];
      module_['problems'][problemIndex + 1] = req.body.problemId;
      module_['problems'][problemIndex] = problemToSwap;
    } else {
      return res.status(400).send('Invalid direction');
    }
  } catch (e) {
    return res.status(500).send(e);
  }
  return res.sendStatus(200);
};

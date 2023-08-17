import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { ModuleAttributesInput } from '../../models/v2/module.model';

import * as ModuleDataLayer from '../../dal/module';
import * as CourseDataLayer from '../../dal/course';
import * as ProblemDataLayer from '../../dal/problem';
import * as LessonDataLayer from '../../dal/lesson';

export const postModule = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  if (!req.body.courseId) return res.status(400).send('missing course id');
  const course = CourseDataLayer.getById(req.body.courseId);
  if (!course) return res.status(400).send('invalid course id');
  try {
    const orderNumber = await CourseDataLayer.getNextOrder(req.body.courseId);
    const payload: ModuleAttributesInput = {
      ...req.body,
      id: uuidv4(),
      orderNumber: orderNumber
    };
    const result = await ModuleDataLayer.create(payload);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
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
    res.status(500).send(e.message);
  }
};

export const getModuleByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const module_ = await ModuleDataLayer.getById(req.params.moduleId);
    if (!module_) res.status(404).send();
    else res.status(200).send(module_);
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const getModuleByProblemId = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  const problem = await ProblemDataLayer.getById(req.params.problemId, true);
  if (!problem) return res.status(400).send('invalid problem id');
  try {
    const modules = await ModuleDataLayer.getById(problem.moduleId);
    if (!modules) return res.status(404).send();
    return res.status(200).send(modules);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const putModule = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const result = await ModuleDataLayer.updateById(
      req.params.moduleId,
      req.body
    );
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const module_ = await ModuleDataLayer.getById(req.params.moduleId);

    const result = await ModuleDataLayer.deleteById(req.params.moduleId);
    await ProblemDataLayer.deleteByModule(req.params.moduleId);
    await LessonDataLayer.deleteByModule(req.params.moduleId);

    await ModuleDataLayer.shiftModules(module_.courseId, module_.orderNumber);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const changeContentOrder = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  let updatedContent: any;
  try {
    let orderNumber: number;

    const payload: any = {
      orderNumber: req.body.newOrderNumber
    };

    // update the problem/lesson to have the new order number
    // while storing the original order number
    if (req.body.contentType === 'problem') {
      const content = await ProblemDataLayer.getById(req.body.id, true);
      orderNumber = content.orderNumber;
    } else if (req.body.contentType === 'lesson') {
      const content = await LessonDataLayer.getById(req.body.id);
      orderNumber = content.orderNumber;
    } else {
      return res.status(400).send('Invalid/missing content type');
    }

    const maxOrderNum = await ModuleDataLayer.getNextOrder(req.params.moduleId);
    if (
      req.body.newOrderNumber < 1 ||
      req.body.newOrderNumber >= maxOrderNum ||
      req.body.newOrderNumber === orderNumber
    )
      return res.status(400).send('Invalid order number');

    // shift the problems and lessons within the range
    await ProblemDataLayer.shiftProblems(
      req.params.moduleId,
      orderNumber,
      req.body.newOrderNumber
    );
    await LessonDataLayer.shiftLessons(
      req.params.moduleId,
      orderNumber,
      req.body.newOrderNumber
    );

    updatedContent =
      req.body.contentType === 'problem'
        ? await ProblemDataLayer.updateById(req.body.id, payload)
        : await LessonDataLayer.updateById(req.body.id, payload);
  } catch (e) {
    return res.status(500).send(e.message);
  }
  return res.status(200).send(updatedContent);
};

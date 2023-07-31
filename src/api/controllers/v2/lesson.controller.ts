import { Request, Response } from 'express';
import { LessonAttributesInput } from '../../models/v2/lesson.model';
import * as LessonDataLayer from '../../dal/lesson';
import * as ProblemDataLayer from '../../dal/problem';
import * as ModuleDataLayer from '../../dal/module';
import { v4 as uuidv4 } from 'uuid';

export const postLesson = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  const module_ = await ModuleDataLayer.getById(req.body.moduleId);
  if (!module_) return res.status(400).send('invalid module id');
  try {
    const orderNumber = await ModuleDataLayer.getNextOrder(req.body.moduleId);
    const payload: LessonAttributesInput = {
      ...req.body,
      id: uuidv4(),
      orderNumber: orderNumber
    };
    const result = await LessonDataLayer.create(payload);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const getLessonByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  // add validation for lessonId?
  try {
    const lessons = await LessonDataLayer.getById(req.params.lessonId);
    if (!lessons) res.status(404).send();
    else res.status(200).send(lessons);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const putLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await LessonDataLayer.updateById(
      req.params.lessonId,
      req.body
    );
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const lesson = await LessonDataLayer.getById(req.params.lessonId);
    const result = await LessonDataLayer.deleteById(req.params.lessonId);

    await ProblemDataLayer.shiftProblems(lesson.moduleId, lesson.orderNumber);
    await LessonDataLayer.shiftLessons(lesson.moduleId, lesson.orderNumber);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

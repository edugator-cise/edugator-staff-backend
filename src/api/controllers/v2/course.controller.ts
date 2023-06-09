import { Request, Response } from 'express';
import { CourseAttributesInput } from '../../models/v2/course.model';
import * as CourseDataLayer from '../../dal/course';
import { v4 as uuidv4 } from 'uuid';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload: CourseAttributesInput = { ...req.body, id: uuidv4() };
    const result = await CourseDataLayer.create(payload);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req.params['courseId'];
    if (payload === undefined) {
      res.status(500).send('error course is undefined');
    }
    const result = await CourseDataLayer.deleteById(payload);
    if (!result) {
      res.status(404).send();
      return;
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params['courseId'];
    if (id === undefined) {
      res.status(500).send('error course is undefined');
    }
    const result = await CourseDataLayer.updateById(id, req.body);
    if (!result) {
      res.status(404).send();
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params['courseId'];
    if (id === undefined) {
      res.status(500).send('error course is undefined');
    }
    const result = await CourseDataLayer.getById(id);
    if (!result) {
      res.status(404).send();
    }
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
};

export const getCourses = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    if (!req.params.organizationId) {
      return res.status(400).send('bad request organizationId not found');
    }
    const results = await CourseDataLayer.getAll(req.params.organizationId);
    if (!results) {
      return res.status(404).send();
    }
    return res.status(200).send(results);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const getCourseStructure = async (
  req: Request,
  res: Response
): Promise<void> => {
  const hidden = req.query.hidden ? req.query.hidden === 'true' : false;
  try {
    const results = await CourseDataLayer.getStructure(
      req.params.courseId,
      hidden
    );
    if (!results) {
      res.status(404).send();
    }
    res.status(200).send(results);
  } catch (e) {
    res.status(500).send(e);
  }
};

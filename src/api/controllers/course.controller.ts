import { Request, Response } from 'express';
import { CourseAttributesInput } from '../models/course.model';
import * as CourseDataLayer from '../dal/course';
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
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const results = await CourseDataLayer.getAll();
    if (!results) {
      res.status(404).send();
    }
    res.status(200).send(results);
  } catch (e) {
    res.status(500).send(e);
  }
};

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
  Lesson,
  LessonInterface,
  LessonDocument
} from '../models/lesson.model';
import * as validator from 'validator';
import { Module, ModuleDocument } from '../models/module.model';

export const getLessons = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let lessons: LessonInterface[];
  try {
    //Find All lessons
    lessons = await Lesson.find().select('-lesson').sort({ number: 1 });
    res.status(200).send(lessons);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const postLesson = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const lesson = new Lesson({
    title: req.body.title,
    author: req.body.author,
    createDate: req.body.createDate,
    updateDate: req.body.updateDate,
    content: req.body.content
  }) as unknown as LessonDocument;

  try {
    const savedLesson = await lesson.save();
    const module: ModuleDocument = await Module.findOne({
      _id: req.body.moduleId
    });
    if (!module) {
      return res.status(404).send('Module not found!');
    }
    module.lessons.push(savedLesson._id);
    await module.save();
    module.content.push(savedLesson._id);
    await module.save();
    return res.send({
      _id: savedLesson._id
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getLessonByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  let lesson: LessonDocument;
  try {
    if (!validator.isMongoId(req.params.lessonId)) {
      throw { message: 'This route requires a valid lesson ID' };
    }

    // Find One Module
    lesson = await Lesson.findOne({ _id: req.params.lessonId });

    if (lesson != null) {
      res.status(200).send(lesson);
    } else {
      res.status(400).send({ message: 'Lesson not found in database' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

export const putLesson = async (req: Request, res: Response): Promise<void> => {
  // makes sure there is a moduleId given in the params
  try {
    if (!validator.isMongoId(req.params.lessonId)) {
      throw { message: 'This route requires a valid lesson ID' };
    }

    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    }

    //TODO: Need to add Validation

    const lesson = await Lesson.findByIdAndUpdate(
      {
        _id: req.params.lessonId
      },
      req.body,
      { new: true }
    );

    if (lesson) {
      res.status(200).type('json').send(lesson);
    } else {
      res
        .status(400)
        .type('json')
        .send({ message: 'Lesson not found in database' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.params.lessonId) {
      const lesson = await Lesson.findOne({
        _id: req.params.lessonId
      });

      if (!lesson) {
        throw { message: 'lesson with given id is not found in database' };
      }
      await lesson.delete();

      // Delete from lessons array on each module <-- Are we not just in one module?
      const modules: ModuleDocument[] = await Module.find();
      let i: number;
      for (i = 0; i < modules.length; i++) {
        modules[i].lessons = modules[i].lessons.filter((lessonId) => {
          return lessonId != new Types.ObjectId(req.params.problemId);
        }) as [Types.ObjectId];
      }
      //Delete from contents array in each module
      for (i = 0; i < modules.length; i++) {
        modules[i].content = modules[i].content.filter((lessonId) => {
          return lessonId != new Types.ObjectId(req.params.problemId);
        }) as [Types.ObjectId];
      }
      modules.forEach(async (module) => {
        await module.save();
      });

      res
        .status(200)
        .type('json')
        .send({ message: 'Lesson successfully deleted' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

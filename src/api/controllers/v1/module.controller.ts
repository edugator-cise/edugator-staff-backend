import { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
  Module,
  ModuleDocument,
  ModuleInterface
} from '../../models/v1/module.model';
import { Problem } from '../../models/v1/problem.model';
import { Lesson } from '../../models/v1/lesson.model';
import { isMongoId } from '../../../util';
import moduleValidation from '../../validation/module.validation';

export const getModules = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let modules: ModuleInterface[];
  try {
    //Find All modules
    modules = await Module.find()
      .select(['-problems', '-lessons'])
      .sort({ number: 1 })
      .find();
    res.status(200).send(modules);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const getModulesWithNonHiddenProblemsAndTestCases = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const modules = await Module.find()
      .populate({
        path: 'problems',
        select: 'id title',
        match: { hidden: false }
      })
      .sort({ number: 1 })
      .populate({
        path: 'lessons',
        select: 'id title'
      })
      .sort({ number: 1 });
    res.status(200).send(modules);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getModuleByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  let modules: ModuleDocument;
  try {
    if (!isMongoId(req.params.moduleId)) {
      throw { message: 'This route requires a valid module ID' };
    }

    // Find One Module
    modules = await Module.findOne({
      _id: req.params.moduleId
    }).select('-problems');

    if (modules != null) {
      res.status(200).send(modules);
    } else {
      res.status(400).send({ message: 'Module not found in database' });
    }
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getModuleByProblemId = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  if (!isMongoId(req.params.problemId)) {
    return res.status(400).send('This route requires a valid problem ID');
  }
  // Get all modules
  let modules: ModuleInterface[] = await Module.find();
  modules = modules.filter((doc) => {
    return doc.problems.includes(new Types.ObjectId(req.params.problemId));
  });
  if (modules.length === 0) {
    return res
      .status(404)
      .send('No module associated with this problemId was found');
  }
  if (modules.length > 1) {
    return res.status(500).send('Multiple modules have this problemId');
  }
  return res.status(200).send(modules[0]);
};

export const getModulesWithProblems = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let modules: ModuleInterface[];
  try {
    //Find All modules
    modules = await Module.find()
      .populate({
        path: 'problems',
        select: 'id title',
        match: { hidden: false }
      })
      .sort({ number: 1 })
      .populate({
        path: 'lessons',
        select: 'id title'
      })
      .sort({ number: 1 });

    res.status(200).send(modules);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const postModules = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    }

    //Joi Validation
    const { error } = moduleValidation(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      const errorMessageNoQuotes = errorMessage.replace(/["]+/g, '');
      res.status(400).type('json').send({
        message: errorMessageNoQuotes
      });
      return;
    }

    const module = await Module.create({
      name: req.body.name,
      number: req.body.number
    });

    res.status(200).send(
      JSON.stringify({
        id: module._id
      })
    );
  } catch (err) {
    // if(res.body.code == 11000)
    // console.log(res);
    res.status(400).type('json').send(err);
  }
};

export const putModule = async (req: Request, res: Response): Promise<void> => {
  // makes sure there is a moduleId given in the params
  try {
    if (!isMongoId(req.params.moduleId)) {
      throw { message: 'This route requires a valid module ID' };
    }

    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    }

    //Joi Validation
    const { error } = moduleValidation(req.body);

    if (error) {
      const errorMessage = error.details[0].message;
      const errorMessageNoQuotes = errorMessage.replace(/["]+/g, '');
      res.status(400).type('json').send({
        message: errorMessageNoQuotes
      });
      return;
    }

    const module = await Module.findByIdAndUpdate(
      {
        _id: req.params.moduleId
      },
      req.body,
      { new: true }
    )
      .select('-problems')
      .select('-lessons')
      .select('-content');

    if (module) {
      res.status(200).type('json').send(module);
    } else {
      res
        .status(400)
        .type('json')
        .send({ message: 'Module not found in database' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const deleteModule = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.params.moduleId) {
      const module = await Module.findOne({
        _id: req.params.moduleId
      });

      if (!module) {
        throw { message: 'Module with given id is not found in database' };
      }
      //Deletes the problems in the problems array from the problems collection
      try {
        for (let i = 0; i < module.problems.length; i++) {
          const problem = await Problem.findOneAndDelete({
            _id: module.problems[i]
          });
          if (!problem) {
            throw { message: 'Problem with given id is not found in database' };
          }
        }
      } catch (err) {
        res.status(400).type('json').send(err);
        return;
      }

      //Delete the lesson arrays
      try {
        for (let i = 0; i < module.lessons.length; i++) {
          const lesson = await Lesson.findOneAndDelete({
            _id: module.lessons[i]
          });
          if (!lesson) {
            throw { message: 'Lesson with given id is not found in database' };
          }
        }
      } catch (err) {
        res.status(400).type('json').send(err);
        return;
      }

      await module.delete();
      res
        .status(200)
        .type('json')
        .send({ message: 'Module successfully deleted' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const changeProblemOrder = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const { moduleId, problemId, direction } = req.body;
    const objectIdRegEx = /[0-9a-f]{24}/g;
    if (problemId.length != 24 || !objectIdRegEx.test(problemId)) {
      return res.status(400).send('problemId not a valid mongoDB ObjectId');
    }

    const module = await Module.findOne({ _id: moduleId });

    if (module.problems.length == 1) {
      return res
        .status(400)
        .send('Cannot change order of only problem in module');
    }

    const problemIndex = module.problems.indexOf(problemId);

    if (problemIndex == -1) {
      return res.status(400).send('Problem not found in module');
    }

    if (direction == 'up') {
      if (problemIndex == 0) {
        return res.status(400).send('Problem already at top of module');
      }

      const problemToSwap = module.problems[problemIndex - 1];
      module.problems[problemIndex - 1] = problemId;
      module.problems[problemIndex] = problemToSwap;
    } else if (direction == 'down') {
      if (problemIndex == module.problems.length - 1) {
        return res.status(400).send('Problem already at bottom of module');
      }

      const problemToSwap = module.problems[problemIndex + 1];
      module.problems[problemIndex + 1] = problemId;
      module.problems[problemIndex] = problemToSwap;
    } else {
      return res.status(400).send('Invalid direction');
    }
    await module.save();
    return res.sendStatus(200);
  } catch (err) {
    return res.status(400).type('json').send(err);
  }
};

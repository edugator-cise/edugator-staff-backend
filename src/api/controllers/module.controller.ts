import { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
  Module,
  ModuleDocument,
  ModuleInterface
} from '../models/module.model';
import { Problem } from '../models/problem.model';
import * as validator from 'validator';

const validateNumberField = (number: number) => {
  if (number < 0 || number > 100) {
    return false;
  }
  return true;
};

export const getModules = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let modules: ModuleInterface[];
  try {
    //Find All modules
    modules = await Module.find().select('-problems').sort({ number: 1 });
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
    const modules = await Module.find().populate({
      path: 'problems',
      match: { hidden: false }
    });
    const modulesWithNonHiddenTestCases = modules.map((val) => {
      const currentModule = {
        _id: val._id,
        name: val.name,
        number: val.number
      };
      const problemsWithoutTestCases = val.problems.map((problem) => {
        const problemToReturn = problem;
        problemToReturn['testCases'] = undefined;
        return problemToReturn;
      });
      currentModule['problems'] = problemsWithoutTestCases;
      return currentModule;
    });
    res.status(200).send(modulesWithNonHiddenTestCases);
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
    if (!validator.isMongoId(req.params.moduleId)) {
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
  if (!validator.isMongoId(req.params.problemId)) {
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
    console.log('TEMP');
    if (!validateNumberField(req.body.number)) {
      throw { message: 'This route requires a valid number to be passed in' };
    }

    const module = await Module.create(req.body);
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
    if (!validator.isMongoId(req.params.moduleId)) {
      throw { message: 'This route requires a valid module ID' };
    }

    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
    }

    if (req.body.name === '' || !validateNumberField(req.body.number)) {
      throw {
        message:
          'This route requires a valid name and/or number to be passed in'
      };
    }

    const module = await Module.findByIdAndUpdate(
      {
        _id: req.params.moduleId
      },
      req.body,
      { new: true }
    ).select('-problems');

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

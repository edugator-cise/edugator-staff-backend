import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Module, ModuleDocument } from '../models/module.model';
import { Problem } from '../models/problem.model';

export const getModules = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let modules: any;
  try {
    //Find All modules
    modules = await Module.find().select('-problems');
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
    const ObjectId = Types.ObjectId;
    if (!ObjectId.isValid(req.params.moduleId)) {
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

export const getModulesWithProblems = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let modules: any;
  try {
    //Find All modules
    modules = await Module.find().populate('problems');
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
    const module = await Module.create(req.body);
    res.status(200).send(
      JSON.stringify({
        id: module._id
      })
    );
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

export const putModule = async (req: Request, res: Response): Promise<void> => {
  // makes sure there is a moduleId given in the params
  try {
    const ObjectId = Types.ObjectId;
    if (!ObjectId.isValid(req.params.moduleId)) {
      throw { message: 'This route requires a valid module ID' };
    }

    if (Object.keys(req.body).length === 0) {
      throw { message: 'This route requires a body to be passed in' };
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

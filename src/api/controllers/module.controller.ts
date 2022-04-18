import { Request, Response } from 'express';
// import { Types } from 'mongoose';
import { IModule, ModuleTable } from '../models/module.mysql.model';
// import { Problem } from '../models/problem.model';
import {
  IProblem,
  ProblemTable,
  CodeTable,
  TestCaseTable
} from '../models/problem.mysql.model';
import validator from 'validator';
import moduleValidation from '../validation/module.validation';
import { translateIdOnModule } from './util';

export const getModules = async (
  _req: Request,
  res: Response
): Promise<void> => {
  let modules: IModule[];
  try {
    //Find All modules
    // modules = await Module.find().select('-problems').sort({ number: 1 });
    modules = await ModuleTable.findAll({
      order: [['number', 'ASC']]
    });
    res.status(200).send(modules);
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

// TODO
export const getModulesWithNonHiddenProblemsAndTestCases = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // populate is a way of resolving the "objectId" FK in mongo
    // so, this returns the id and title of the problems of a module where hidden is false for those problems.
    // const modules = await Module.find()
    //   .populate({
    //     path: 'problems',
    //     select: 'id title',
    //     match: { hidden: false }
    //   })
    //   .sort({ number: 1 });
    const modules: IModule[] = await ModuleTable.findAll({
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          where: {
            hidden: false
          },
          attributes: {
            include: ['id', 'title']
          }
          // include: [
          //   { model: TestCaseTable, as: 'testCases' },
          //   { model: CodeTable, as: 'code' }
          // ]
        }
      ]
    });
    res.status(200).send(modules);
  } catch (err) {
    res.status(400).send(err);
  }
};

export const getModuleByID = async (
  req: Request,
  res: Response
): Promise<void> => {
  // let modules: ModuleDocument;
  let module: any; // TODO: don't make this any type
  try {
    if (!validator.isInt(req.params.moduleId + '')) {
      throw { message: 'This route requires a valid module ID' };
    }

    // Find One Module
    // modules = await Module.findOne({
    //   _id: req.params.moduleId
    // }).select('-problems');
    module = await ModuleTable.findOne({
      where: { id: req.params.moduleId }
    });

    if (module != null) {
      res.status(200).send(translateIdOnModule(module));
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
  if (!validator.isInt(req.params.problemId + '')) {
    return res.status(400).send('This route requires a valid problem ID');
  }
  // Get all modules
  const problem: IProblem = await ProblemTable.findOne({
    where: {
      id: req.params.problemId
    }
  });

  if (problem == null) {
    return res
      .status(404)
      .send('No module associated with this problemId was found');
  }

  let modules: IModule[] = await ModuleTable.findAll();
  modules = modules.filter((module) => module.id == problem.moduleId);
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
  let modules: IModule[];
  try {
    //Find All modules
    // modules = await Module.find()
    //   .populate({
    //     path: 'problems',
    //     select: 'id title'
    //   })
    //   .sort({ number: 1 });
    modules = await ModuleTable.findAll({
      include: [
        {
          model: ProblemTable,
          as: 'problems',
          attributes: {
            include: ['id', 'title']
          }
          // include: [
          //   { model: TestCaseTable, as: 'testCases' },
          //   { model: CodeTable, as: 'code' }
          // ]
        }
      ],
      order: [['number', 'ASC']]
    });

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

    // const module = await Module.create({
    //   name: req.body.name,
    //   number: req.body.number
    // });

    // do we need to initialize problems and other associations here???
    const module = await ModuleTable.create({
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
    if (!validator.isInt(req.params.moduleId + '')) {
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

    // const module = await Module.findByIdAndUpdate(
    //   {
    //     _id: req.params.moduleId
    //   },
    //   req.body,
    //   { new: true }
    // ).select('-problems');
    const numUpdated = await ModuleTable.update(req.body, {
      where: { id: req.params.moduleId }
    });

    if (numUpdated > 0) {
      const module = await ModuleTable.findOne({
        where: { id: req.params.moduleId }
      });
      res.status(200).type('json').send(translateIdOnModule(module));
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
      // const module = await Module.findOne({
      //   _id: req.params.moduleId
      // });
      const module = await ModuleTable.findOne({
        where: { id: req.params.moduleId },
        include: [
          {
            model: ProblemTable,
            as: 'problems',
            include: [
              { model: TestCaseTable, as: 'testCases' },
              { model: CodeTable, as: 'code' }
            ]
          }
        ]
      });

      if (!module) {
        throw { message: 'Module with given id is not found in database' };
      }
      //Deletes the problems in the problems array from the problems collection
      try {
        // for (let i = 0; i < module.problems.length; i++) {
        //   const problem = await Problem.findOneAndDelete({
        //     _id: module.problems[i]
        //   });
        //   if (!problem) {
        //     throw { message: 'Problem with given id is not found in database' };
        //   }
        // }

        await ProblemTable.destroy({
          where: { moduleId: module.id }
        });
        for (const problem of module.problems) {
          await CodeTable.destroy({
            where: { problemId: problem.id }
          });
          await TestCaseTable.destroy({
            where: { problemId: problem.id }
          });
        }
      } catch (err) {
        res.status(400).type('json').send(err);
        return;
      }

      await module.destroy();
      res
        .status(200)
        .type('json')
        .send({ message: 'Module successfully deleted' });
    }
  } catch (err) {
    res.status(400).type('json').send(err);
  }
};

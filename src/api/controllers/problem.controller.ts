import { Request, Response } from 'express';
import Module from '../models/module.model';
import Problem from '../models/problem.model';
import problemValidation from '../validation/problem.validation';

const getStudentProblems = async (
  req: Request,
  res: Response
): Promise<void> => {
  let studentProblems: any;
  if (req.params.problemId) {
    //Find exact problem
    studentProblems = await Problem.findOne({
      hidden: false,
      _id: req.params.problemId
    });
  } else if (req.params.moduleId) {
    const module = await Module.findOne({
      hidden: false,
      _id: req.params.moduleId
    }).populate('problems');
    studentProblems = module.problems;
  } else {
    studentProblems = await Problem.find({
      hidden: false
    });
  }

  res.status(200).send(studentProblems);
};

const getAdminProblems = async (req: Request, res: Response): Promise<void> => {
  let adminProblems: any;
  if (req.params.problemId) {
    //Find exact problem
    adminProblems = await Problem.findOne({
      _id: req.params.problemId
    });
  } else if (req.params.moduleId) {
    const module = await Module.findOne({
      _id: req.params.moduleId
    }).populate('problems');
    adminProblems = module.problems;
  } else {
    adminProblems = await Problem.find({});
  }

  res.status(200).send(adminProblems);
};

const postProblem = async (req: Request, res: Response): Promise<void> => {
  const { error } = problemValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }
  const problem = new Problem({
    problemType: req.params.problemType,
    title: req.params.title,
    hidden: req.params.hidden,
    language: req.params.language,
    dueDate: req.params.dueDate,
    code: req.params.code,
    fileExtension: req.params.fileExtension,
    testCases: req.params.testCases,
    timeLimit: req.params.timeLimit,
    memoryLimit: req.params.memoryLimit,
    buildCommand: req.params.buildCommand
  });

  try {
    const savedProblem = await problem.save();
    res.send({ id: savedProblem._id });
  } catch (error) {
    res.status(400).send(error);
  }
};

export { getStudentProblems, getAdminProblems, postProblem };

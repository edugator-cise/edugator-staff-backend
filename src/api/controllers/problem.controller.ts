import { Request, Response } from 'express';
import Module from '../models/module.model';
import { Problem, ProblemDocument } from '../models/problem.model';
import problemValidation from '../validation/problem.validation';

const readStudentProblems = async (
  req: Request,
  res: Response
): Promise<void> => {
  let studentProblems: any;
  if (req.params.problemId) {
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

const readAdminProblems = async (
  req: Request,
  res: Response
): Promise<void> => {
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

const createProblem = async (req: Request, res: Response): Promise<void> => {
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

const updateProblem = async (req: Request, res: Response): Promise<void> => {
  const { error } = problemValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }

  const problem: ProblemDocument = Problem.findById(
    req.params.problemId
  ) as unknown as ProblemDocument;
  problem.problemType = req.params.problemType;
  problem.title = req.params.title;
  problem.hidden = req.params.hidden as unknown as boolean;
  problem.language = req.params.language;
  problem.dueDate = new Date(req.params.dueDate);
  problem.code = JSON.parse(req.params.code);
  problem.fileExtension = req.params.fileExtension;
  problem.testCases = JSON.parse(req.params.testCases);
  problem.timeLimit = req.params.timeLimit as unknown as number;
  problem.memoryLimit = req.params.memoryLimit as unknown as number;
  problem.buildCommand = req.params.buildCommand;

  try {
    const savedProblem = await problem.save();
    res.send({ id: savedProblem._id });
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteProblem = async (req: Request, res: Response): Promise<void> => {
  try {
    await Problem.deleteOne({
      id: req.params.problemId
    });
    res.status(200);
  } catch (error) {
    res.status(400).send(error);
  }
};

export {
  readStudentProblems,
  readAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem
};

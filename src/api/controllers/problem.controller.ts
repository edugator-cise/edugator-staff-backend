import { Request, Response } from 'express';
import { Module, ModuleDocument } from '../models/module.model';
import { Problem, ProblemDocument } from '../models/problem.model';
import problemValidation from '../validation/problem.validation';

const readStudentProblems = async (
  req: Request,
  res: Response
): Promise<void> => {
  let studentProblems: any;
  if (req.body.problemId) {
    studentProblems = await Problem.findOne({
      hidden: false,
      _id: req.body.problemId
    });
  } else if (req.body.moduleId) {
    const module = await Module.findOne({
      hidden: false,
      _id: req.body.moduleId
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
  if (req.body.problemId) {
    //Find exact problem
    adminProblems = await Problem.findOne({
      _id: req.body.problemId
    });
  } else if (req.body.moduleId) {
    const module = await Module.findOne({
      _id: req.body.moduleId
    }).populate('problems');
    adminProblems = module.problems;
  } else {
    adminProblems = await Problem.find({});
  }

  res.status(200).send(adminProblems);
};

const createProblem = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { error } = problemValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const problem: ProblemDocument = new Problem({
    problemType: req.body.problemType,
    title: req.body.title,
    hidden: req.body.hidden,
    templatePackage: req.body.templatePackage,
    language: req.body.language,
    dueDate: req.body.dueDate,
    code: req.body.code,
    fileExtension: req.body.fileExtension,
    testCases: req.body.testCases,
    timeLimit: req.body.timeLimit,
    memoryLimit: req.body.memoryLimit,
    buildCommand: req.body.buildCommand
  }) as unknown as ProblemDocument;

  try {
    const savedProblem = await problem.save();
    const module: ModuleDocument = await Module.findOne({
      name: req.body.moduleName
    });
    if (!module) {
      return res.status(400).send('Module not found!');
    }
    module.problems.push(savedProblem._id);
    const updatedModule = await module.save();
    return res.send({ id: updatedModule._id });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const updateProblem = async (req: Request, res: Response): Promise<void> => {
  const { error } = problemValidation(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
  }

  const problem: ProblemDocument = Problem.findById(
    req.body.problemId
  ) as unknown as ProblemDocument;
  problem.problemType = req.body.problemType;
  problem.title = req.body.title;
  problem.hidden = req.body.hidden as unknown as boolean;
  problem.templatePackage = req.body.templatePackage;
  problem.language = req.body.language;
  problem.dueDate = new Date(req.body.dueDate);
  problem.code = JSON.parse(req.body.code);
  problem.fileExtension = req.body.fileExtension;
  problem.testCases = JSON.parse(req.body.testCases);
  problem.timeLimit = req.body.timeLimit as unknown as number;
  problem.memoryLimit = req.body.memoryLimit as unknown as number;
  problem.buildCommand = req.body.buildCommand;

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
      id: req.body.problemId
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

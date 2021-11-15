import { Request, Response } from 'express';
import { Module, ModuleDocument } from '../models/module.model';
import { Problem, ProblemDocument, TestCase } from '../models/problem.model';
import {
  problemValidation,
  problemValidationWithoutModuleId
} from '../validation/problem.validation';

const filterOpenTestCases = (testCases: TestCase[]): TestCase[] => {
  return testCases.filter((test) => test.visibility === 0);
};

const readStudentProblems = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let studentProblems: any;
  if (req.params.problemId) {
    const objectIdRegEx = /[0-9a-f]{24}/g;
    if (
      req.params.problemId.length != 24 ||
      !objectIdRegEx.test(req.params.problemId)
    ) {
      return res.status(400).send('problemId not a valid mongoDB ObjectId');
    }
    try {
      const problem = await Problem.findOne({
        hidden: false,
        _id: req.params.problemId
      });
      if (!problem) {
        return res.status(404).send();
      }
      studentProblems = problem;
      // make the test cases for a problem unaccessible to students
      studentProblems.testCases = filterOpenTestCases(
        studentProblems.testCases
      );
      studentProblems.code.header = undefined;
      studentProblems.code.footer = undefined;
    } catch (error) {
      return res.status(400).send(error);
    }
  } else if (req.params.moduleId) {
    const objectIdRegEx = /[0-9a-f]{24}/g;
    if (
      req.params.moduleId.length != 24 ||
      !objectIdRegEx.test(req.params.moduleId)
    ) {
      return res.status(400).send('moduleId not a valid mongoDB ObjectId');
    }
    const module = await Module.findOne({
      _id: req.params.moduleId
    }).populate('problems');
    if (!module) {
      return res.status(404).send();
    }
    studentProblems = module.problems.filter((item) => {
      return !(item as unknown as ProblemDocument).hidden;
    });
    // make the test cases for all problems unaccessible to students
    studentProblems.forEach((item) => {
      item.testCases = filterOpenTestCases(item.testCases);
      item.code.header = undefined;
      item.code.footer = undefined;
    });
  } else {
    studentProblems = await Problem.find({
      hidden: false
    });
    // make the test cases for all problems unaccessible to students
    studentProblems.forEach((item) => {
      item.testCases = filterOpenTestCases(item.testCases);
      item.code.header = undefined;
      item.code.footer = undefined;
    });
  }

  return res.status(200).send(studentProblems);
};

const readAdminProblems = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let adminProblems: any;
  if (req.params.problemId) {
    //Find exact problem
    const objectIdRegEx = /[0-9a-f]{24}/g;
    if (
      req.params.problemId.length != 24 ||
      !objectIdRegEx.test(req.params.problemId)
    ) {
      return res.status(400).send('problemId not a valid mongoDB ObjectId');
    }
    try {
      adminProblems = await Problem.findOne({
        _id: req.params.problemId
      });
      if (!adminProblems) {
        return res.status(404).send();
      }
    } catch (err) {
      return res.status(400).send(err);
    }
  } else if (req.params.moduleId) {
    const objectIdRegEx = /[0-9a-f]{24}/g;
    if (
      req.params.moduleId.length != 24 ||
      !objectIdRegEx.test(req.params.moduleId)
    ) {
      return res.status(400).send('moduleId not a valid mongoDB ObjectId');
    }
    const module = await Module.findOne({
      _id: req.params.moduleId
    }).populate('problems');
    if (!module) {
      return res.status(404).send();
    }
    adminProblems = module.problems;
  } else {
    adminProblems = await Problem.find({});
  }

  return res.status(200).send(adminProblems);
};

const createProblem = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { error } = problemValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const problem = new Problem({
    statement: req.body.statement,
    title: req.body.title,
    hidden: req.body.hidden,
    language: req.body.language,
    dueDate: req.body.dueDate,
    code: req.body.code,
    fileExtension: req.body.fileExtension,
    testCases: req.body.testCases,
    templatePackage: req.body.templatePackage,
    timeLimit: req.body.timeLimit,
    memoryLimit: req.body.memoryLimit,
    buildCommand: req.body.buildCommand
  }) as unknown as ProblemDocument;

  try {
    const savedProblem = await problem.save();
    const module: ModuleDocument = await Module.findOne({
      _id: req.body.moduleId
    });
    if (!module) {
      return res.status(404).send('Module not found!');
    }
    module.problems.push(savedProblem._id);
    await module.save();
    return res.send({
      _id: savedProblem._id
    });
  } catch (error) {
    return res.status(400).send(error);
  }
};

const updateProblem = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const { error } = problemValidationWithoutModuleId(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const objectIdRegEx = /[0-9a-f]{24}/g;
  if (
    req.params.problemId.length != 24 ||
    !objectIdRegEx.test(req.params.problemId)
  ) {
    return res.status(400).send('problemId not a valid mongoDB ObjectId');
  }
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.problemId,
      {
        statement: req.body.statement,
        title: req.body.title,
        hidden: req.body.hidden,
        language: req.body.language,
        dueDate: req.body.dueDate,
        code: req.body.code,
        fileExtension: req.body.fileExtension,
        testCases: req.body.testCases,
        templatePackage: req.body.templatePackage,
        timeLimit: req.body.timeLimit,
        memoryLimit: req.body.memoryLimit,
        buildCommand: req.body.buildCommand
      },
      { new: true }
    );
    if (!problem) {
      return res.status(404).send();
    }
    return res.status(200).send(problem);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const deleteProblem = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  const objectIdRegEx = /[0-9a-f]{24}/g;
  if (
    req.params.problemId.length != 24 ||
    !objectIdRegEx.test(req.params.problemId)
  ) {
    return res.status(400).send('problemId not a valid mongoDB ObjectId');
  }
  try {
    const problem = await Problem.findOne({
      _id: req.params.problemId
    });
    if (!problem) {
      return res.status(404).send();
    }
    await problem.delete();
    return res.sendStatus(200);
  } catch (error) {
    return res.status(400).send(error);
  }
};

export {
  readStudentProblems,
  readAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem
};

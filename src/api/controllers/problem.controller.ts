import { Request, Response } from 'express';
// import { Module, ModuleDocument } from '../models/module.model';
// import { Problem, ProblemDocument, TestCase } from '../models/problem.model';
import {
  TestCase,
  IProblem,
  ProblemTable,
  TestCaseTable,
  CodeTable
} from '../models/problem.mysql.model';
import { ModuleTable, IModule } from '../models/module.mysql.model';
import {
  problemValidation,
  problemValidationWithoutModuleId,
  validateTestCases,
  TestCaseVisibility
} from '../validation/problem.validation';
import validator from 'validator';
import { Problem } from '../models/problem.model';

const filterOpenTestCases = (testCases: TestCase[]): TestCase[] => {
  return testCases.filter(
    (test) => test.visibility === TestCaseVisibility.IO_VISIBLE
  );
};

const readStudentProblems = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let studentProblems: any;
  if (req.params.problemId) {
    if (!validator.isInt(req.params.problemId + '')) {
      return res.status(400).send('problemId not a valid id');
    }
    try {
      // const problem = await Problem.findOne({
      //   hidden: false,
      //   _id: req.params.problemId
      // });
      const problem = await ProblemTable.findOne({
        where: { hidden: false, id: req.params.problemId },
        include: [
          { model: TestCaseTable, as: 'testCases' },
          { model: CodeTable, as: 'code' }
        ]
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
    if (!validator.isInt(req.params.moduleId + '')) {
      return res.status(400).send('moduleId not a valid id');
    }
    // const module = await Module.findOne({
    //   _id: req.params.moduleId
    // }).populate('problems');
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
      return res.status(404).send();
    }
    studentProblems = module.problems.filter((item) => {
      return !(item as unknown as IProblem).hidden;
    });
    // make the test cases for all problems unaccessible to students
    studentProblems.forEach((item) => {
      item.testCases = filterOpenTestCases(item.testCases);
      item.code.header = undefined;
      item.code.footer = undefined;
    });
  } else {
    // studentProblems = await Problem.find({
    //   hidden: false
    // });
    studentProblems = await ProblemTable.find({
      where: { hidden: false },
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
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
    if (!validator.isInt(req.params.problemId + '')) {
      return res.status(400).send('problemId not a valid id');
    }
    try {
      // adminProblems = await Problem.findOne({
      //   _id: req.params.problemId
      // });
      adminProblems = await ProblemTable.findOne({
        where: { id: req.params.problemId },
        include: [
          { model: TestCaseTable, as: 'testCases' },
          { model: CodeTable, as: 'code' }
        ]
      });
      if (!adminProblems) {
        return res.status(404).send();
      }
    } catch (err) {
      return res.status(400).send(err);
    }
  } else if (req.params.moduleId) {
    if (!validator.isInt(req.params.moduleId + '')) {
      return res.status(400).send('moduleId not a valid id');
    }
    // const module = await Module.findOne({
    //   _id: req.params.moduleId
    // }).populate('problems');
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
      return res.status(404).send();
    }
    adminProblems = module.problems;
  } else {
    // adminProblems = await Problem.find({});
    adminProblems = await ProblemTable.findAll({
      include: [
        { model: TestCaseTable, as: 'testCases' },
        { model: CodeTable, as: 'code' }
      ]
    });
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
  if (!validateTestCases(req.body.testCases)) {
    return res
      .status(400)
      .send('Body needs at least one test case visible to public');
  }

  // const problem = new Problem({
  //   statement: req.body.statement,
  //   title: req.body.title,
  //   hidden: req.body.hidden,
  //   language: req.body.language,
  //   dueDate: req.body.dueDate,
  //   code: req.body.code,
  //   fileExtension: req.body.fileExtension,
  //   testCases: req.body.testCases,
  //   templatePackage: req.body.templatePackage,
  //   timeLimit: req.body.timeLimit,
  //   memoryLimit: req.body.memoryLimit,
  //   buildCommand: req.body.buildCommand
  // }) as unknown as IProblem;

  try {
    const module: IModule = await ModuleTable.findOne({
      where: { id: req.body.moduleId }
    });
    if (!module) {
      return res.status(404).send('Module not found!');
    }

    const savedProblem = ProblemTable.create(
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
        buildCommand: req.body.buildCommand,
        moduleId: module.id
      },
      {
        include: [
          { association: ProblemTable.TestCases, as: 'testCases' },
          { association: ProblemTable.Codes, as: 'code' }
        ]
      }
    );
    // const savedProblem = await problem.save();
    // const module: IModule = await Module.findOne({
    //   _id: req.body.moduleId
    // });

    // module.problems.push(savedProblem._id);
    // await module.save();
    return res.send({
      _id: savedProblem.id
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
  if (!validator.isInt(req.params.problemId + '')) {
    return res.status(400).send('problemId is not a problem id');
  }
  try {
    // const problem = await Problem.findByIdAndUpdate(
    //   req.params.problemId,
    //   {
    //     statement: req.body.statement,
    //     title: req.body.title,
    //     hidden: req.body.hidden,
    //     language: req.body.language,
    //     dueDate: req.body.dueDate,
    //     code: req.body.code,
    //     fileExtension: req.body.fileExtension,
    //     testCases: req.body.testCases,
    //     templatePackage: req.body.templatePackage,
    //     timeLimit: req.body.timeLimit,
    //     memoryLimit: req.body.memoryLimit,
    //     buildCommand: req.body.buildCommand
    //   },
    //   { new: true }
    // );
    const problem = await Problem.findOne({
      where: { id: req.params.problemId }
    });
    if (!problem) {
      return res.status(404).send();
    }

    await ProblemTable.update(
      {
        statement: req.body.statement,
        title: req.body.title,
        hidden: req.body.hidden,
        language: req.body.language,
        dueDate: req.body.dueDate,
        fileExtension: req.body.fileExtension,
        templatePackage: req.body.templatePackage,
        timeLimit: req.body.timeLimit,
        memoryLimit: req.body.memoryLimit,
        buildCommand: req.body.buildCommand
      },
      {
        where: { id: req.params.problemId }
      }
    );
    await TestCaseTable.destroy({ where: { problemId: problem.id } });
    const tests: TestCase[] = req.body.testCases.map(
      (test) =>
        <TestCase>{
          problemId: problem.id,
          ...test
        }
    );
    await TestCaseTable.bulkCreate(tests);
    await CodeTable.destroy({ where: { problemId: problem.id } });
    await CodeTable.update(req.body.code, { where: { problemId: problem.id } });

    return res.status(200).send(problem);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const deleteProblem = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  if (!validator.isInt(req.params.problemId + '')) {
    return res.status(400).send('problemId is not a problem id');
  }
  try {
    // const problem = await Problem.findOne({
    //   _id: req.params.problemId
    // });
    const problem = await ProblemTable.findOne({
      where: { id: req.params.problemId },
      include: [
        { association: ProblemTable.TestCases, as: 'testCases' },
        { association: ProblemTable.Codes, as: 'code' }
      ]
    });
    if (!problem) {
      return res.status(404).send();
    }
    // await problem.delete();
    await ProblemTable.destroy({
      where: {
        id: problem.id
      }
    });
    await CodeTable.destroy({
      where: {
        problemId: problem.id
      }
    });
    await TestCaseTable.destroy({
      where: {
        problemId: problem.id
      }
    });

    // Delete from problems array on each module
    // const modules: ModuleDocument[] = await Module.find();
    // let i: number;
    // for (i = 0; i < modules.length; i++) {
    //   modules[i].problems = modules[i].problems.filter((problemId) => {
    //     return problemId != new Types.ObjectId(req.params.problemId);
    //   }) as [Types.ObjectId];
    // }
    // modules.forEach(async (module) => {
    //   await module.save();
    // });
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

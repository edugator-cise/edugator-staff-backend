import { Request, Response } from 'express';
import {
  ProblemAttributesInput,
  TestCaseAttributesInput
} from '../../models/v2/problem.model';
import * as ProblemDataLayer from '../../dal/problem';
import * as ModuleDataLayer from '../../dal/module';
import { v4 as uuidv4 } from 'uuid';

export const createProblem = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  const module_ = await ModuleDataLayer.getById(req.body.moduleId);
  if (!module_) return res.status(400).send('invalid module id');
  try {
    const testCases: TestCaseAttributesInput[] = req.body.testCases;
    delete req.body['testCases'];
    const payload: ProblemAttributesInput = { ...req.body, id: uuidv4() };
    const result = await ProblemDataLayer.create(payload);

    const testCaseResults: TestCaseAttributesInput[] = [];
    testCases.forEach(async (testCase) => {
      const testCasePayload: TestCaseAttributesInput = {
        ...testCase,
        id: uuidv4()
      };
      const testCaseResult = await ProblemDataLayer.createTestCase(
        testCasePayload
      );
      testCaseResults.push(testCaseResult);
    });

    result.testCases = testCaseResults;
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const readStudentProblems = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  if (req.params.problemId) {
    const problem = await ProblemDataLayer.getById(req.params.problemId);
    if (!problem || problem.hidden) return res.sendStatus(404);
    return res.status(200).send(problem);
  } else if (req.params.moduleId) {
    const problems = await ProblemDataLayer.getByModule(
      req.params.problemId,
      false
    );
    return res.status(200).send(problems);
  }
  return res.sendStatus(500);
};

export const readAdminProblems = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  if (req.params.problemId) {
    const problem = await ProblemDataLayer.getById(req.params.problemId);
    if (!problem) return res.sendStatus(404);
    return res.status(200).send(problem);
  } else if (req.params.moduleId) {
    const problems = await ProblemDataLayer.getByModule(
      req.params.problemId,
      true
    );
    return res.status(200).send(problems);
  }
  return res.sendStatus(500);
};

export const updateProblem = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const result = await ProblemDataLayer.updateById(
      req.params.problemId,
      req.body
    );
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const deleteProblem = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  try {
    const result = await ProblemDataLayer.deleteById(req.params.problemId);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

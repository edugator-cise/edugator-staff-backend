import { Request, Response } from 'express';
import { ProblemAttributesInput } from '../models/problemv2.model';
import * as ProblemDataLayer from '../dal/problem';
import * as ModuleDataLayer from '../dal/module';
import { v4 as uuidv4 } from 'uuid';

export const createProblem = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  const module_ = await ModuleDataLayer.getById(req.body.moduleId);
  if (!module_) return res.status(400).send('invalid module id');
  try {
    const payload: ProblemAttributesInput = { ...req.body, id: uuidv4() };
    const result = await ProblemDataLayer.create(payload);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

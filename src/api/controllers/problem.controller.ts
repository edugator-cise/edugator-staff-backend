import { Request, Response } from 'express';
import ProblemModel from '../models/problem.model';

const getStudentProblems = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const studentProblems = await ProblemModel.find({
    hidden: true
  });

  res.status(200).send(studentProblems);
};

export default getStudentProblems;

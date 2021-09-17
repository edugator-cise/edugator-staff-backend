import { Request, Response } from 'express';
import ProblemModel from '../models/problem.model';

const getStudentProblems = async (
  req: Request,
  res: Response
): Promise<void> => {
  let studentProblems: any;
  if (req.params.problemId) {
    //Find exact problem
    studentProblems = await ProblemModel.find({
      hidden: false,
      _id: req.params.problemId
    });
  } else {
    studentProblems = await ProblemModel.find({
      hidden: false
    });
  }

  res.status(200).send(studentProblems);
};

export default getStudentProblems;

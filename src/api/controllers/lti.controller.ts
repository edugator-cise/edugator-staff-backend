import { Request, Response } from 'express';
import { listStudents, postGrade } from '../services/ltijs';
// import { CANVAS_HOST, LTI_CLIENT_ID } from '../../config/vars';

const submitAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  req;
  const members = await listStudents();
  if (members.length == 0) return res.sendStatus(500);

  members.forEach((member) => {
    postGrade(member.user_id, 8);
  });

  return res.sendStatus(200);
};

// Names and Roles route
const getMembers = async (req: Request, res: Response): Promise<Response> => {
  req;
  const members = await listStudents();
  if (members.length > 0) return res.send(members);
  else return res.sendStatus(500).send('No students found!');
};

export { submitAssignment, getMembers };

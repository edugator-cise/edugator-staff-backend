import { Request, Response } from 'express';
import { getCourseMembers, postGrade, LTIRoles } from '../services/ltijs';
import { CANVAS_HOST } from '../../config/vars';

const submitAssignment = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const members = await getCourseMembers(
    `${CANVAS_HOST}/api/lti/courses/2`,
    LTIRoles.Student
  );
  if (members.length == 0) return res.sendStatus(500);

  members.forEach((member) => {
    postGrade(member.user_id, 8);
  });

  return res.sendStatus(200);
};

const getMembers = async (_req: Request, res: Response): Promise<Response> => {
  const members = await getCourseMembers(
    `${CANVAS_HOST}/api/lti/courses/2`,
    LTIRoles.Student
  );
  if (members.length > 0) return res.send(members);
  else return res.sendStatus(500).send('No students found!');
};

export { submitAssignment, getMembers };

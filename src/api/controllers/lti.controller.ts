import { Request, Response } from 'express';
import { lti } from '../services/ltijs';
import { CANVAS_HOST, LTI_CLIENT_ID } from '../../config/vars';

const submitAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const lineItem = `${CANVAS_HOST}/api/lti/courses/2/line_items/1`;
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };
  const userId = req.body.user;
  const score = req.body.grade;

  idToken['user'] = userId;
  // Creating Grade object
  const gradeObj = {
    userId: userId,
    scoreGiven: score,
    scoreMaximum: 10,
    activityProgress: 'Completed',
    gradingProgress: 'FullyGraded'
  };
  try {
    const responseGrade = await lti.Grade.submitScore(
      idToken,
      lineItem,
      gradeObj
    );
    return res.send(responseGrade);
  } catch (err) {
    return res.status(500).send({ err: err.message });
  }
};

// Names and Roles route
const getMembers = async (req: Request, res: Response): Promise<Response> => {
  req;
  const idToken = {
    iss: 'https://canvas.instructure.com',
    clientId: LTI_CLIENT_ID
  };
  idToken['platformContext'] = {
    namesRoles: {
      context_memberships_url: `${CANVAS_HOST}/api/lti/courses/2/names_and_roles`
    }
  };

  try {
    const result = await lti.NamesAndRoles.getMembers(idToken);
    if (result) return res.send(result.members);
    return res.sendStatus(500);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

export { submitAssignment, getMembers };

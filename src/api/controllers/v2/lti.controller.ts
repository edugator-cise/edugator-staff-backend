import { Request, Response } from 'express';

import {
  LTIRoles,
  getLineItem,
  getCourseMembers,
  postGrade
} from '../../services/ltijs';
import { CANVAS_HOST } from '../../../config/vars';

import * as CourseDataLayer from '../../dal/course';
import * as ProblemDataLayer from '../../dal/problem';

export const linkCourse = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  if (res.locals.context.roles.indexOf(LTIRoles.Instructor) == -1)
    return res.sendStatus(403);

  const lineItemsUrl = res.locals.context.endpoint.lineitems;
  const courseUrl = lineItemsUrl.substring(0, lineItemsUrl.lastIndexOf('/'));

  // will be used for course enrollment table
  // const courseMembers: Array<CourseMember> = await getCourseMembers(courseUrl);

  const course = await CourseDataLayer.getById(req.body.courseId);
  if (!course) return res.status(400).send('Invalid course id');

  const payload: any = { ltiCourseLink: courseUrl };
  const result = await CourseDataLayer.updateById(req.body.courseId, payload);

  if (!result) return res.status(500).send('Error linking course');

  return res.status(200).send(`Linked course at ${courseUrl}`);
};

export const linkAssignment = async (
  req: Request,
  res: Response
): Promise<Record<string, any>> => {
  if (res.locals.context.roles.indexOf(LTIRoles.Instructor) == -1)
    return res.sendStatus(403);
  if (!req.body.problemId)
    return res.status(400).send('Missing Edugator problem id');

  const lineItemId = res.locals.context.endpoint.lineitem;
  if (!lineItemId) return res.status(400).send('Missing line item id');

  const lineItem = await getLineItem(lineItemId);

  const problem = await ProblemDataLayer.getById(req.body.problemId);
  if (!problem) return res.status(400).send('Invalid problem id');

  const payload: any = {
    ltiAssignmentLink: lineItemId,
    ltiScore: lineItem.scoreMaximum
  };
  const result = await ProblemDataLayer.updateById(req.body.problemId, payload);

  if (!result) return res.status(500).send('Error linking problem');

  return res.status(200).send(`Linked assignment at ${lineItemId}`);
};

export const submitAssignment = async (
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

export const getMembers = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const members = await getCourseMembers(
    `${CANVAS_HOST}/api/lti/courses/2`,
    LTIRoles.Student
  );
  if (members.length > 0) return res.send(members);
  else return res.sendStatus(500);
};

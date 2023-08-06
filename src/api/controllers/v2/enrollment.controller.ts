import { Request, Response } from 'express';
import { EnrollmentAttributes } from '../../models/v2/enrollment.model';
import * as EnrollmentDataLayer from '../../dal/enrollment';
import { WithAuthProp } from '@clerk/clerk-sdk-node';

export const getRoster = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  // check is user_id has the right role
  const enrollments = await EnrollmentDataLayer.getAllCourseEnrollments(
    req.params.courseId
  );
  return res.status(200).send(enrollments);
};

export const createEnrollment = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // check if user_id has the right role
    const payload: EnrollmentAttributes = {
      userId: req.body.userId,
      courseId: req.params.courseId,
      role: req.body.role,
      email: req.body.email,
      status: req.body.status
    };
    const result = await EnrollmentDataLayer.create(payload);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const updateEnrollment = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // check if person has ability to update enrollment
    const result = await EnrollmentDataLayer.updateById(
      req.body.userId,
      req.params.courseId,
      req.body
    );
    if (!result) {
      return res.sendStatus(400);
    }
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const deleteEnrollmentById = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  // check is user has permissions
  // check if person has ability to update enrollment
  const payload: any = {
    status: 'deleted'
  };

  try {
    const result = await EnrollmentDataLayer.updateById(
      req.body.userId,
      req.params.courseId,
      payload
    );
    if (!result) {
      return res.sendStatus(400);
    }
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

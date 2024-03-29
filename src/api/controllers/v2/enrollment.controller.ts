import { Request, Response } from 'express';
import { EnrollmentAttributes } from '../../models/v2/enrollment.model';
import * as EnrollmentDataLayer from '../../dal/enrollment';
import { WithAuthProp } from '@clerk/clerk-sdk-node';

export const getUserEnrollments = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const enrollments = await EnrollmentDataLayer.getByUser(req.auth.userId);
    if (!enrollments) return res.status(404).send();
    else return res.status(200).send(enrollments);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

export const getRoster = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
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
  try {
    if (req.body.userId == req.auth.userId)
      return res.status(400).send('You cannot delete yourself from the course');

    const result = await EnrollmentDataLayer.updateById(
      req.body.userId,
      req.params.courseId,
      {
        status: 'removed'
      }
    );
    if (!result) {
      return res.sendStatus(400);
    }
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

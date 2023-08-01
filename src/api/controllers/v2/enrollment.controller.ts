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
    req.body.courseId
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
      courseId: req.body.courseId,
      role: req.body.role,
      email: req.body.email,
      status: req.body.status
    };
    const result = await EnrollmentDataLayer.create(payload);
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const updateEnrollment = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // check if person has ability to update enrollment
    const { userId, courseId } = req.body;
    const result = await EnrollmentDataLayer.updateById(
      userId,
      courseId,
      req.body
    );
    if (!result) {
      return res.status(400).send();
    }
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

export const deleteEnrollmentById = async (
  req: WithAuthProp<Request>,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  // check is user has permissions
  // check if person has ability to update enrollment
  try {
    const { userId, courseId } = req.body;
    const result = await EnrollmentDataLayer.updateById(
      userId,
      courseId,
      req.body
    );
    if (!result) {
      return res.status(404).send();
    }
    return res.status(200).send(result);
  } catch (e) {
    return res.status(500).send(e);
  }
};

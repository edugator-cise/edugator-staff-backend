import { NextFunction, Request, Response } from 'express';
import { WithAuthProp } from '@clerk/clerk-sdk-node';
import * as EnrollmentDataLayer from '../dal/enrollment';

const NeedsInstructorPermissions = async (
  req: WithAuthProp<Request>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { auth } = req;
  if (!auth || !auth.userId) {
    res.sendStatus(400);
  }
  const courseId = req.params.courseId || req.body.courseId;
  const user = await EnrollmentDataLayer.findByUserAndCourse(
    req.auth.userId,
    courseId
  );
  if (!user) {
    res.status(404);
  }
  if (user.role !== 'instructor') {
    res.status(401).send('User does not have sufficient permissions');
  }
  next();
};

export { NeedsInstructorPermissions };

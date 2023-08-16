import { NextFunction, Request, Response, Router } from 'express';
import { WithAuthProp } from '@clerk/clerk-sdk-node';

import courseRouter from './course.routes';
import organizationRouter from './organization.routes';
import moduleRouter from './module.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { studentLessonRouter, adminLessonRouter } from './lesson.routes';
import invitationRouter from './invitation.routes';
import enrollmentRouter from './enrollment.routes';
import codeRouter from './code.routes';

import { clerk } from '../../services/clerk';

const router = Router();
router.use(clerk.expressWithAuth());
router.use(
  (req: WithAuthProp<Request>, res: Response, next: NextFunction): any => {
    if (!req.auth.userId) return res.sendStatus(401);
    else return next();
  }
);

router.use('/course', courseRouter);
router.use('/organization', organizationRouter);
router.use('/module', moduleRouter);
router.use('/code/run', codeRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/student/lesson', studentLessonRouter);
router.use('/admin/lesson', adminLessonRouter);
router.use('/invitations', invitationRouter);
router.use('/enrollments', enrollmentRouter);

export default router;

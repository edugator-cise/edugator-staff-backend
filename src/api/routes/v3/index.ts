import { Router } from 'express';
import courseRouter from './course.routes';
import organizationRouter from './organization.routes';
import moduleRouter from './module.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { studentLessonRouter, adminLessonRouter } from './lesson.routes';
import invitationRouter from './invitation.routes';
import codeRouter from './code.routes';

import { clerk } from '../../services/clerk';

const router = Router();
router.use(clerk.expressRequireAuth());

router.use('/course', courseRouter);
router.use('/organization', organizationRouter);
router.use('/module', moduleRouter);
router.use('/code/run', codeRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/student/lesson', studentLessonRouter);
router.use('/admin/lesson', adminLessonRouter);
router.use('/invitations', invitationRouter);

export default router;

import { Router } from 'express';
import { courseRouter } from '../v2/course.routes';
import { organizationRouter } from '../v2/organization.routes';
import { moduleRouter } from '../v2/module.routes';
import { studentProblemRouter, adminProblemRouter } from '../v2/problem.routes';
import { studentLessonRouter, adminLessonRouter } from '../v2/lesson.routes';
import invitationRouter from '../v2/invitation.routes';

import { clerk } from '../../services/clerk';

const router = Router();
router.use(clerk.expressRequireAuth());

router.use('/course', courseRouter);
router.use('/organization', organizationRouter);
router.use('/module', moduleRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/student/lesson', studentLessonRouter);
router.use('/admin/lesson', adminLessonRouter);
router.use('/invitations', invitationRouter);

export default router;

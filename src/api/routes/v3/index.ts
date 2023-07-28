import { Router } from 'express';
import { courseRouter } from '../v2/course.routes';
import { organizationRouter } from '../v2/organization.routes';
import { moduleRouter } from '../v2/module.routes';
import { studentProblemRouter, adminProblemRouter } from '../v2/problem.routes';
import { studentLessonRouter, adminLessonRouter } from '../v2/lesson.routes';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = Router();
router.use(ClerkExpressRequireAuth());
router.use('/course', courseRouter);
router.use('/organization', organizationRouter);
router.use('/module', moduleRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/student/lesson', studentLessonRouter);
router.use('/admin/lesson', adminLessonRouter);

export default router;

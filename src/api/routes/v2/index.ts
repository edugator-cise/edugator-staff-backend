import { Router } from 'express';
import { courseRouter } from './course.routes';
import { organizationRouter } from './organization.routes';
import { moduleRouter } from './module.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { studentLessonRouter, adminLessonRouter } from './lesson.routes';

const router = Router();

router.use('/course', courseRouter);
router.use('/organization', organizationRouter);
router.use('/module', moduleRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/student/lesson', studentLessonRouter);
router.use('/admin/lesson', adminLessonRouter);

export default router;

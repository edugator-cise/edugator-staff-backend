import healthRouter from './health.routes';
import codeRouter from './code.routes';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { moduleRouter } from './module.routes';
import { submissionRouter } from './submission.routes';
import { studentLessonRouter, adminLessonRouter } from './lesson.routes';
import { Router } from 'express';

const router = Router();

router.use('/health', healthRouter);
router.use('/module', moduleRouter);
router.use('/code/run', codeRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/user', userRouter);
router.use('/auth', authRouter);
router.use('/submission', submissionRouter);
router.use('/student/lesson', studentLessonRouter);
router.use('/admin/lesson', adminLessonRouter);

export default router;

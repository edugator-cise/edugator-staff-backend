import healthRouter from './health.routes';
import codeRouter from './code.routes';
import authRouter from './auth.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { moduleRouter } from './module.routes';
import { submissionRouter } from './submission.routes';
import { Router } from 'express';

const router = Router();

router.use('/health', healthRouter);
router.use('/module', moduleRouter);
router.use('/code/run', codeRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);
router.use('/user', authRouter);
router.use('/submission', submissionRouter);

export default router;

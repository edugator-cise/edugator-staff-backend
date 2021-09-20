import healthRouter from './health.routes';
import codeRouter from './code.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { Router } from 'express';

const router = Router();

router.use('/health', healthRouter);
router.use('/code/run', codeRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);

export default router;

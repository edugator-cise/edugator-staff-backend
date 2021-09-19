import healthRouter from './health.routes';
import { studentProblemRouter, adminProblemRouter } from './problem.routes';
import { Router } from 'express';

const router = Router();

router.use('/health', healthRouter);
router.use('/student/problem', studentProblemRouter);
router.use('/admin/problem', adminProblemRouter);

export default router;

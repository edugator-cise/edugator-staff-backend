import healthRouter from './health.routes';
import codeRouter from './code.routes';
import { Router } from 'express';

const router = Router();

router.use('/health', healthRouter);
router.use('/code/run', codeRouter);

export default router;

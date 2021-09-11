import healthRouter from './health.routes';
import { Router } from 'express';

const router = Router();

router.use('/health', healthRouter);

export default router;

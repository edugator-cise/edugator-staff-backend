import { Router } from 'express';
import { courseRouter } from './course.routes';
const router = Router();

router.use('/course', courseRouter);

export default router;

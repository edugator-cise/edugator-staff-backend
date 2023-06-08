import { Router } from 'express';
import { courseRouter } from './course.routes';
import { organizationRouter } from './organization.routes';
const router = Router();

router.use('/course', courseRouter);
router.use('/organization', organizationRouter);

export default router;

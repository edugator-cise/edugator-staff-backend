import { Router } from 'express';
import {
  createCourse,
  deleteCourse,
  getCourseById,
  updateCourse,
  getCourseStructure,
  changeModuleOrder
} from '../../controllers/v2/course.controller';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

router.route('/').post(authenticateJWT, createCourse);
router
  .route('/:courseId')
  .delete(authenticateJWT, deleteCourse)
  .put(authenticateJWT, updateCourse)
  .get(getCourseById);
router.route('/:courseId/structure').get(getCourseStructure);
router
  .route('/:courseId/changeModuleOrder')
  .post(authenticateJWT, changeModuleOrder);

export default router;

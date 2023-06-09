import { Router } from 'express';
import {
  create,
  deleteCourse,
  getCourseById,
  updateCourse
} from '../../controllers/course.controller';
const courseRouter = Router();

courseRouter.route('/').post(create);
courseRouter
  .route('/:courseId')
  .delete(deleteCourse)
  .put(updateCourse)
  .get(getCourseById);

export { courseRouter };

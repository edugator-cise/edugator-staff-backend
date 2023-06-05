import { Router } from 'express';
import {
  create,
  deleteCourse,
  getCourseById,
  updateCourse,
  getCourses
} from '../../controllers/course.controller';
const courseRouter = Router();

courseRouter.route('/').post(create).get(getCourses);
courseRouter
  .route('/:courseId')
  .delete(deleteCourse)
  .put(updateCourse)
  .get(getCourseById);

export { courseRouter };

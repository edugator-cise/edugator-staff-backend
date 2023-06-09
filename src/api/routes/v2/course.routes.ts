import { Router } from 'express';
import {
  create,
  deleteCourse,
  getCourseById,
  updateCourse,
  getCourses,
  getCourseStructure
} from '../../controllers/v2/course.controller';
const courseRouter = Router();

courseRouter.route('/').post(create).get(getCourses);
courseRouter
  .route('/:courseId')
  .delete(deleteCourse)
  .put(updateCourse)
  .get(getCourseById);
courseRouter.route('/:courseId/structure').get(getCourseStructure);

export { courseRouter };

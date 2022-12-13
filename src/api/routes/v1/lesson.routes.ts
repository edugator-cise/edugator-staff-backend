import * as express from 'express';
import {
  postLesson,
  putLesson,
  deleteLesson,
  getLessons,
  getLessonByID
} from '../../controllers/lesson.controller';
import { authenticateJWT } from '../../middlewares/auth';
const studentLessonRouter = express.Router();
const adminLessonRouter = express.Router();

adminLessonRouter.route('/').post(authenticateJWT, postLesson).get(getLessons);

adminLessonRouter
  .route('/:lessonId')
  .get(getLessonByID)
  .put(authenticateJWT, putLesson)
  .delete(authenticateJWT, deleteLesson);

studentLessonRouter.route('/?').get(getLessons);

studentLessonRouter.route('/:lessonId').get(getLessonByID);

export { studentLessonRouter, adminLessonRouter };

import * as express from 'express';
import {
  putLesson,
  deleteLesson
} from '../../controllers/v1/lesson.controller';

import {
  postLesson,
  getLessons,
  getLessonByID
} from '../../controllers/v2/lesson.controller';

import { authenticateJWT } from '../../middlewares/auth';
const studentLessonRouter = express.Router();
const adminLessonRouter = express.Router();

adminLessonRouter.route('/').post(postLesson).get(getLessons);

adminLessonRouter
  .route('/:lessonId')
  .get(getLessonByID)
  .put(authenticateJWT, putLesson)
  .delete(authenticateJWT, deleteLesson);

studentLessonRouter.route('/?').get(getLessons);

studentLessonRouter.route('/:lessonId').get(getLessonByID);

export { studentLessonRouter, adminLessonRouter };

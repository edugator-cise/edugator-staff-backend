import * as express from 'express';

import {
  postLesson,
  getLessonByID,
  putLesson,
  deleteLesson
} from '../../controllers/v2/lesson.controller';
import { authenticateJWT } from '../../middlewares/auth';

const studentLessonRouter = express.Router();
const adminLessonRouter = express.Router();

studentLessonRouter.route('/:lessonId').get(getLessonByID);

adminLessonRouter.route('/').post(authenticateJWT, postLesson);
adminLessonRouter
  .route('/:lessonId')
  .get(authenticateJWT, getLessonByID)
  .put(authenticateJWT, putLesson)
  .delete(authenticateJWT, deleteLesson);

export { studentLessonRouter, adminLessonRouter };

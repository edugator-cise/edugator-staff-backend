import * as express from 'express';

import {
  postLesson,
  getLessonByID,
  putLesson,
  deleteLesson
} from '../../controllers/v2/lesson.controller';

const studentLessonRouter = express.Router();
const adminLessonRouter = express.Router();

studentLessonRouter.route('/:lessonId').get(getLessonByID);

adminLessonRouter.route('/').post(postLesson);
adminLessonRouter
  .route('/:lessonId')
  .get(getLessonByID)
  .put(putLesson)
  .delete(deleteLesson);

export { studentLessonRouter, adminLessonRouter };

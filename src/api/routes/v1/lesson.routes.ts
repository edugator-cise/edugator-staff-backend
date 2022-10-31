import * as express from 'express';
import * as lessons from '../../controllers/lesson.controller';
import { authenticateJWT } from '../../middlewares/auth';
const lessonRouter = express.Router();

lessonRouter
  .route('/findByModule/:moduleId')
  .get(lessons.getLessons)
  .post(authenticateJWT, lessons.postLessons);
lessonRouter
  .route('/:lessonId')
  .get(lessons.getLessonByID)
  .put(authenticateJWT, lessons.putLesson)
  .delete(authenticateJWT, lessons.deleteLesson);

export { lessonRouter };

import { Router } from 'express';
import {
  create,
  deleteCourse,
  getCourseById,
  updateCourse,
  getCourseStructure,
  changeModuleOrder,
  getInvitations,
  inviteMembers,
  cancelInvitations
} from '../../controllers/v2/course.controller';
const courseRouter = Router();

courseRouter.route('/').post(create);
courseRouter
  .route('/:courseId')
  .delete(deleteCourse)
  .put(updateCourse)
  .get(getCourseById);
courseRouter.route('/:courseId/structure').get(getCourseStructure);
courseRouter.route('/:courseId/changeModuleOrder').post(changeModuleOrder);

courseRouter
  .route('/:courseId/invitations')
  .get(getInvitations)
  .post(inviteMembers);
courseRouter
  .route('/:courseId/invitations/:invitationId')
  .delete(cancelInvitations);

export { courseRouter };

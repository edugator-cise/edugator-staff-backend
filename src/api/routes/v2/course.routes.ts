import {
  create,
  deleteCourse,
  getCourseById,
  updateCourse,
  getCourseStructure,
  changeModuleOrder
} from '../../controllers/v2/course.controller';
import {
  createEnrollment,
  deleteEnrollmentById,
  getRoster,
  updateEnrollment
} from '../../controllers/v2/enrollment.controller';
import {
  getInvitations,
  createInvitations,
  deleteInvitations
} from '../../controllers/v2/invitation.controller';
import { NeedsInstructorPermissions } from '../../middlewares/permissions';

import { Router } from 'express';

const courseRouter = Router();

courseRouter.route('/').post(create);
courseRouter
  .route('/:courseId')
  .delete(deleteCourse)
  .put(updateCourse)
  .get(getCourseById);
courseRouter.route('/:courseId/structure').get(getCourseStructure);
courseRouter
  .route('/:courseId/enrollment')
  .get(NeedsInstructorPermissions, getRoster)
  .post(NeedsInstructorPermissions, createEnrollment)
  .put(NeedsInstructorPermissions, updateEnrollment)
  .delete(NeedsInstructorPermissions, deleteEnrollmentById);
courseRouter.route('/:courseId/changeModuleOrder').post(changeModuleOrder);

courseRouter
  .route('/:courseId/invitations')
  .get(NeedsInstructorPermissions, getInvitations)
  .post(NeedsInstructorPermissions, createInvitations);
courseRouter
  .route('/:courseId/invitations/:invitationId')
  .delete(NeedsInstructorPermissions, deleteInvitations);

export { courseRouter };

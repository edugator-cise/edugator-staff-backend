import {
  createCourse,
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

const router = Router();

router.route('/').post(NeedsInstructorPermissions, createCourse);
router
  .route('/:courseId')
  .delete(NeedsInstructorPermissions, deleteCourse)
  .put(NeedsInstructorPermissions, updateCourse)
  .get(getCourseById);
router.route('/:courseId/structure').get(getCourseStructure);
router
  .route('/:courseId/changeModuleOrder')
  .post(NeedsInstructorPermissions, changeModuleOrder);

router
  .route('/:courseId/enrollment')
  .get(NeedsInstructorPermissions, getRoster)
  .post(NeedsInstructorPermissions, createEnrollment)
  .put(NeedsInstructorPermissions, updateEnrollment)
  .delete(NeedsInstructorPermissions, deleteEnrollmentById);

router
  .route('/:courseId/invitations')
  .get(NeedsInstructorPermissions, getInvitations)
  .post(NeedsInstructorPermissions, createInvitations);
router
  .route('/:courseId/invitations/:invitationId')
  .delete(NeedsInstructorPermissions, deleteInvitations);

export default router;

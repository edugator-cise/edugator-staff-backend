import { Router } from 'express';
import {
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
  createOrganization,
  updateOrganization
} from '../../controllers/v2/organization.controller';
import { getCourses } from '../../controllers/v2/course.controller';
import { authenticateJWT } from '../../middlewares/auth';

const router = Router();

router
  .route('/')
  .get(getOrganizations)
  .post(authenticateJWT, createOrganization);
router
  .route('/:organizationId')
  .get(getOrganizationById)
  .put(authenticateJWT, updateOrganization)
  .delete(authenticateJWT, deleteOrganization);
router.route('/:organizationId/courses').get(getCourses);

export default router;

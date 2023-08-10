import { Router } from 'express';
import {
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
  createOrganization,
  updateOrganization
} from '../../controllers/v2/organization.controller';
import { getCourses } from '../../controllers/v2/course.controller';

const router = Router();

router.route('/').get(getOrganizations).post(createOrganization);
router
  .route('/:organizationId')
  .get(getOrganizationById)
  .put(updateOrganization)
  .delete(deleteOrganization);
router.route('/:organizationId/courses').get(getCourses);

export default router;

import { Router } from 'express';
import {
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
  create,
  updateOrganization
} from '../../controllers/v2/organization.controller';
import { getCourses } from '../../controllers/v2/course.controller';

const organizationRouter = Router();

organizationRouter.route('/').get(getOrganizations).post(create);
organizationRouter
  .route('/:organizationId')
  .get(getOrganizationById)
  .put(updateOrganization)
  .delete(deleteOrganization);
organizationRouter.route('/:organizationId/courses').get(getCourses);

export { organizationRouter };

import { Router } from 'express';
import {
  getOrganizations,
  getOrganizationById,
  deleteOrganization,
  create,
  updateOrganization
} from '../../controllers/organization.controller';

const organizationRouter = Router();

organizationRouter.route('/').get(getOrganizations).post(create);
organizationRouter
  .route('/:organizationId')
  .get(getOrganizationById)
  .put(updateOrganization)
  .delete(deleteOrganization);

export { organizationRouter };

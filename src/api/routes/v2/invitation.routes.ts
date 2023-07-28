import * as express from 'express';

import {
  getUserInvitations,
  acceptInvitation,
  rejectInvitation
} from '../../controllers/v2/invitations.controller';

const router = express.Router();

// TODO: add course invitation routes to ./course.routes.ts
router.route('/').get(getUserInvitations);
router.route('/:invitationId/accept').post(acceptInvitation);
router.route('/:invitationId/reject').post(rejectInvitation);

export default router;

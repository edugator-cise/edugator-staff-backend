import * as express from 'express';

import {
  getUserInvitations,
  acceptInvitation,
  rejectInvitation
} from '../../controllers/v2/invitation.controller';

const router = express.Router();

router.route('/').get(getUserInvitations);
router.route('/:invitationId/accept').post(acceptInvitation);
router.route('/:invitationId/reject').post(rejectInvitation);

export default router;

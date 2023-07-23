import * as express from 'express';
import { getHealth } from '../../controllers/v1/health.controller';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
const router = express.Router();

router.route('/').get(ClerkExpressRequireAuth(), getHealth);

export default router;

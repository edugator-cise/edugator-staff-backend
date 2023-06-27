import * as express from 'express';
import { getHealth } from '../../controllers/v1/health.controller';
const router = express.Router();

router.route('/').get(getHealth);

export default router;

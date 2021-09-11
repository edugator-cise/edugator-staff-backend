import * as express from 'express';
import { getHealth } from '../../controllers/health.controller';
const router = express.Router();

router.route('/').get(getHealth);

export default router;

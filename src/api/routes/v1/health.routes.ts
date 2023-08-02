import * as express from 'express';
import { getHealth } from '../../controllers/v1/health.controller';
const router = express.Router();

/**
 * @openapi
 * /health:
 *  get:
 *     tags:
 *     - Healthcheck
 *     description: Responds if the app is up and running
 *     responses:
 *       200:
 *         description: App is up and running
 */
router.route('/').get(getHealth);

export default router;

import * as express from 'express';

import { getUserEnrollments } from '../../controllers/v2/enrollment.controller';

const router = express.Router();

router.route('/').get(getUserEnrollments);

export default router;

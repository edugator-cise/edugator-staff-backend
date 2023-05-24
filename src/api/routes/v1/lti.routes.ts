import * as express from 'express';
import { submitAssignment, getMembers } from '../../controllers/lti.controller';
import { lti } from '../../services/ltijs';
const router = express.Router();

router.use('/ltijs', lti.app);
router.use(express.json());

router.route('/submit').post(submitAssignment);
router.route('/members').get(getMembers);

export default router;

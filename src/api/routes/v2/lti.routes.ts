import * as express from 'express';
import {
  submitAssignment,
  getMembers,
  linkAssignment,
  linkCourse
} from '../../controllers/v2/lti.controller';
import { lti } from '../../services/ltijs';
const router = express.Router();

lti.app.post('/linkCourse', linkCourse);
lti.app.post('/linkAssignment', linkAssignment);

router.use('/ltijs', lti.app);
router.use(express.json());

router.route('/submit').post(submitAssignment);
router.route('/members').get(getMembers);

export default router;

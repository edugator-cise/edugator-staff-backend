import * as express from 'express';
import {
  submitAssignment,
  getMembers,
  linkAssignment,
  linkCourse
} from '../../controllers/v2/lti.controller';
import { lti } from '../../services/ltijs';
const ltiRouter = express.Router();

lti.app.post('/linkCourse', linkCourse);
lti.app.post('/linkAssignment', linkAssignment);

ltiRouter.use('/ltijs', lti.app);
ltiRouter.use(express.json());

ltiRouter.route('/submit').post(submitAssignment);
ltiRouter.route('/members').get(getMembers);

export default ltiRouter;

import * as express from 'express';

import {
  getStudentProblem,
  createProblem,
  getAdminProblem,
  updateProblem,
  deleteProblem
} from '../../controllers/v2/problem.controller';

const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/:problemId').get(getStudentProblem);

// Admin routes
adminProblemRouter.route('/').post(createProblem);
adminProblemRouter
  .route('/:problemId')
  .get(getAdminProblem)
  .put(updateProblem)
  .delete(deleteProblem);

export { adminProblemRouter, studentProblemRouter };

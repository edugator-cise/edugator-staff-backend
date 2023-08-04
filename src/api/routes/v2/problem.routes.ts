import * as express from 'express';

import {
  getStudentProblem,
  createProblem,
  getAdminProblem,
  updateProblem,
  deleteProblem
} from '../../controllers/v2/problem.controller';
import { authenticateJWT } from '../../middlewares/auth';

const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/:problemId').get(getStudentProblem);

// Admin routes
adminProblemRouter.route('/').post(authenticateJWT, createProblem);
adminProblemRouter
  .route('/:problemId')
  .get(authenticateJWT, getAdminProblem)
  .put(authenticateJWT, updateProblem)
  .delete(authenticateJWT, deleteProblem);

export { adminProblemRouter, studentProblemRouter };

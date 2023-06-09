import * as express from 'express';
import {
  readAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  readStudentProblems
} from '../../controllers/v1/problem.controller';
import { authenticateJWT } from '../../middlewares/auth';
const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/').get(readStudentProblems);
studentProblemRouter.route('/:problemId').get(readStudentProblems);
studentProblemRouter.route('/findByModule/:moduleId').get(readStudentProblems);

// Admin routes
adminProblemRouter
  .route('/')
  .get(authenticateJWT, readAdminProblems)
  .post(authenticateJWT, createProblem);
adminProblemRouter
  .route('/:problemId')
  .get(authenticateJWT, readAdminProblems)
  .put(authenticateJWT, updateProblem)
  .delete(authenticateJWT, deleteProblem);
adminProblemRouter
  .route('/findByModule/:moduleId')
  .get(authenticateJWT, readAdminProblems);

export { adminProblemRouter, studentProblemRouter };

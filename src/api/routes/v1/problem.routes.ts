import * as express from 'express';
import {
  readStudentProblems,
  readAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem
} from '../../controllers/problem.controller';
import { authenticateJWT } from '../../middlewares/auth';
const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/?').get(readStudentProblems);
studentProblemRouter.route('/:problemId').get(readStudentProblems);
studentProblemRouter
  .route('/student/problem/findByModule/:moduleId')
  .get(readStudentProblems);

// Admin routes
adminProblemRouter
  .route('/?')
  .get(authenticateJWT, readAdminProblems)
  .post(createProblem);
adminProblemRouter
  .route('/:problemId')
  .get(authenticateJWT, readAdminProblems)
  .put(authenticateJWT, updateProblem)
  .delete(authenticateJWT, deleteProblem);
adminProblemRouter
  .route('/findByModule/:moduleId')
  .get(authenticateJWT, readAdminProblems);

export { adminProblemRouter, studentProblemRouter };

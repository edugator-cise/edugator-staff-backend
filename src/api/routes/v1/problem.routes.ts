import * as express from 'express';
import {
  getAllStudentProblems,
  getStudentProblemsByModuleId,
  readAdminProblems,
  createProblem,
  updateProblem,
  deleteProblem,
  getStudentProblemsByID
} from '../../controllers/problem.controller';
import { authenticateJWT } from '../../middlewares/auth';
const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/').get(getAllStudentProblems);
studentProblemRouter.route('/:problemId').get(getStudentProblemsByID);
studentProblemRouter
  .route('/student/problem/findByModule/:moduleId')
  .get(getStudentProblemsByModuleId);

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

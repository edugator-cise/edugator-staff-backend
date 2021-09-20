import * as express from 'express';
import {
  getStudentProblems,
  getAdminProblems,
  postProblem
} from '../../controllers/problem.controller';
const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/?').get(getStudentProblems);
studentProblemRouter.route('/:problemId').get(getStudentProblems);
studentProblemRouter
  .route('/student/problem/findByModule/:moduleId')
  .get(getStudentProblems);

// Admin routes
adminProblemRouter.route('/?').get(getAdminProblems).post(postProblem);
adminProblemRouter.route('/:problemId').get(getAdminProblems).put().delete();
adminProblemRouter.route('/findByModule/:moduleId').get(getAdminProblems);

export { adminProblemRouter, studentProblemRouter };

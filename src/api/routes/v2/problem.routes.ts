import * as express from 'express';

import {
  createProblem,
  readAdminProblems,
  updateProblem,
  deleteProblem,
  readStudentProblems
} from '../../controllers/v2/problem.controller';

const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/').get(readStudentProblems);
studentProblemRouter.route('/:problemId').get(readStudentProblems);
studentProblemRouter.route('/findByModule/:moduleId').get(readStudentProblems);

// Admin routes
adminProblemRouter.route('/').get(readAdminProblems).post(createProblem);
adminProblemRouter
  .route('/:problemId')
  .get(readAdminProblems)
  .put(updateProblem)
  .delete(deleteProblem);
adminProblemRouter.route('/findByModule/:moduleId').get(readAdminProblems);

export { adminProblemRouter, studentProblemRouter };

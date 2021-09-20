import * as express from 'express';
import getStudentProblems from '../../controllers/problem.controller';
const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/?').get(getStudentProblems);
studentProblemRouter.route('/:problemId').get(getStudentProblems);
studentProblemRouter.route('/student/problem/findByModule/:moduleId').get();

// Admin routes
adminProblemRouter.route('/?').get().post();
adminProblemRouter.route('/:problemId').get().put().delete();
adminProblemRouter.route('/findByModule/:moduleId').get();

export { adminProblemRouter, studentProblemRouter };

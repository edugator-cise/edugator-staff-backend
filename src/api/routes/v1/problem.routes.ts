import * as express from 'express';
const adminProblemRouter = express.Router();
const studentProblemRouter = express.Router();

// Student routes
studentProblemRouter.route('/?').get();
studentProblemRouter.route('/:problemId').get();
studentProblemRouter.route('/student/problem/findByModule/:moduleId').get();

// Admin routes
adminProblemRouter.route('/?').get().post();
adminProblemRouter.route('/:problemId').get().put().delete();
adminProblemRouter.route('/findByModule/:moduleId').get();

export { adminProblemRouter, studentProblemRouter };

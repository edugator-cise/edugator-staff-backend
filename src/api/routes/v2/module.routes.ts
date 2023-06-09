import * as express from 'express';
import * as modules from '../../controllers/v2/module.controller';
// import { authenticateJWT } from '../../middlewares/auth';
const moduleRouter = express.Router();

// Student routes
// moduleRouter
//   .route('/WithProblems')
//   .get(authenticateJWT, modules.getModulesWithProblems);
moduleRouter
  .route('/WithNonHiddenProblems')
  .get(modules.getModulesWithNonHiddenProblemsAndTestCases);
moduleRouter.route('/?').get(modules.getModules).post(modules.postModule);

// // Admin routes
// moduleRouter
//   .route('/changeProblemOrder')
//   .post(authenticateJWT, modules.changeProblemOrder);
moduleRouter.route('/:moduleId').get(modules.getModuleByID);
//   .put(authenticateJWT, modules.putModule)
//   .delete(authenticateJWT, modules.deleteModule);
//
moduleRouter.route('/ByProblemId/:problemId').get(modules.getModuleByProblemId);

export { moduleRouter };

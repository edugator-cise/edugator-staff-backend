import * as express from 'express';
import * as modules from '../../controllers/v2/module.controller';
// import { authenticateJWT } from '../../middlewares/auth';
const moduleRouter = express.Router();

// Student routes
// moduleRouter
//   .route('/WithProblems')
//   .get(authenticateJWT, modules.getModulesWithProblems);
moduleRouter.route('/?').get(modules.getModules).post(modules.postModule);

// // Admin routes
moduleRouter
  .route('/:moduleId')
  .get(modules.getModuleByID)
  .put(modules.putModule)
  .delete(modules.deleteModule);
moduleRouter
  .route('/:moduleId/changeContentOrder')
  .post(modules.changeContentOrder);
//
moduleRouter.route('/ByProblemId/:problemId').get(modules.getModuleByProblemId);

export { moduleRouter };

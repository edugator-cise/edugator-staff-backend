import * as express from 'express';
import * as modules from '../../controllers/module.controller';
import { authenticateJWT } from '../../middlewares/auth';
const moduleRouter = express.Router();

// Student routes
moduleRouter
  .route('/?')
  .get(modules.getModules)
  .post(authenticateJWT, modules.postModules);
moduleRouter.route('/WithProblems').get(modules.getModulesWithProblems);
moduleRouter
  .route('/:moduleId')
  .get(modules.getModules)
  .put(authenticateJWT, modules.putModule)
  .delete(authenticateJWT, modules.deleteModule);

export { moduleRouter };

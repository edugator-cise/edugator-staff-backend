import * as express from 'express';
import * as modules from '../../controllers/module.controller';
const moduleRouter = express.Router();

// Student routes
moduleRouter.route('/?').get(modules.getModules).post(modules.postModules);
moduleRouter.route('/WithProblems').get(modules.getModulesWithProblems);
moduleRouter
  .route('/:moduleId')
  .get(modules.getModules)
  .put(modules.putModule)
  .delete(modules.deleteModule);
export { moduleRouter };

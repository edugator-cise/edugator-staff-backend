import * as express from 'express';
import * as modules from '../../controllers/v2/module.controller';
import { authenticateJWT } from '../../middlewares/auth';
const router = express.Router();

router
  .route('/?')
  .get(modules.getModules)
  .post(authenticateJWT, modules.postModule);
router
  .route('/:moduleId')
  .get(modules.getModuleByID)
  .put(authenticateJWT, modules.putModule)
  .delete(authenticateJWT, modules.deleteModule);
router
  .route('/:moduleId/changeContentOrder')
  .post(authenticateJWT, modules.changeContentOrder);

router.route('/ByProblemId/:problemId').get(modules.getModuleByProblemId);

export default router;

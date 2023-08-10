import * as express from 'express';
import * as modules from '../../controllers/v2/module.controller';
const router = express.Router();

router.route('/?').get(modules.getModules).post(modules.postModule);
router
  .route('/:moduleId')
  .get(modules.getModuleByID)
  .put(modules.putModule)
  .delete(modules.deleteModule);
router.route('/:moduleId/changeContentOrder').post(modules.changeContentOrder);

router.route('/ByProblemId/:problemId').get(modules.getModuleByProblemId);

export default router;

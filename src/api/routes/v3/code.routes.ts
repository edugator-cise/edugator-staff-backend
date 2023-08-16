import * as express from 'express';
import {
  runCode,
  handleRunComplete,
  submitCode,
  handleSubmitComplete,
  deleteCode
} from '../../controllers/v3/code.controller';

const router = express.Router();

router.route('/').post(runCode);
router.route('/complete').put(handleRunComplete);
router.route('/evaluate').post(submitCode);
router.route('/evaluate/complete').put(handleSubmitComplete);
router.route('/submission').delete(deleteCode);

export default router;

import * as express from 'express';
import {
  runCode,
  getCode,
  submitCode
} from '../../controllers/code.controller';
const router = express.Router();

router.route('/').post(runCode);
router.route('/submission').post(getCode);
router.route('/evaluate').post(submitCode);

export default router;

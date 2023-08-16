import * as express from 'express';
import {
  runCode,
  getCode,
  submitCode,
  deleteCode
} from '../../controllers/v2/code.controller';

const router = express.Router();

router.route('/').post(runCode);
router.route('/submission').post(getCode);
router.route('/evaluate').post(submitCode).delete(deleteCode);

export default router;

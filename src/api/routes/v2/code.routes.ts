import * as express from 'express';
import {
  runCode,
  getCode,
  submitCode,
  deleteCode
} from '../../controllers/v2/code.controller';

const codeRouter = express.Router();

codeRouter.route('/').post(runCode);
codeRouter.route('/submission').post(getCode).delete(deleteCode);
codeRouter.route('/evaluate').post(submitCode);

export { codeRouter };

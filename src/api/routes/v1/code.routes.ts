import * as express from 'express';
import { runCode, getCode } from '../../controllers/code.controller';
const router = express.Router();

router.route('/').post(runCode);

router.route('/:runId').get(getCode);

export default router;

import * as express from 'express';
import { authenticateUser } from '../../controllers/auth.controller';
const router = express.Router();

router.route('/login').post(authenticateUser);

export default router;

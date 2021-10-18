import * as express from 'express';
import { authenticateUser, createUser } from '../../controllers/auth.controller';
import { authenticateJWT } from '../../middlewares/auth';
const router = express.Router();

router.route('/login').post(authenticateUser);
router.route('/create').post(authenticateJWT, createUser);

export default router;

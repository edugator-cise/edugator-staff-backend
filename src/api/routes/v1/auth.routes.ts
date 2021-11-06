import * as express from 'express';
import {
  authenticateUser,
  createUser,
  getUsers
} from '../../controllers/auth.controller';
import { authenticateJWT } from '../../middlewares/auth';
const router = express.Router();

router.route('/login').post(authenticateUser);
router.route('/create').post(authenticateJWT, createUser);
router.route('/getUsers').get(getUsers);

export default router;

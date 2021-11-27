import * as express from 'express';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser
} from '../../controllers/user.controller';
import { authenticateJWT } from '../../middlewares/auth';
const router = express.Router();

// TODO: Separate top and bottom
router.route('/create').post(authenticateJWT, createUser);
router.route('/getUsers').get(authenticateJWT, getUsers);
router.route('/updateUser').put(authenticateJWT, updateUser);
// router.route('/updateRole').put(authenticateJWT, updateRole);
router.route('/deleteUser').delete(authenticateJWT, deleteUser);

export default router;

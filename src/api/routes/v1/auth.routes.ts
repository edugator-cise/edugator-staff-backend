import * as express from 'express';
import {
  authenticateUser,
  createUser,
  deleteUser,
  getUsers,
  updateRole,
  updateUser
} from '../../controllers/auth.controller';
import { authenticateJWT } from '../../middlewares/auth';
const router = express.Router();

router.route('/login').post(authenticateUser);
// TODO: Separate top and bottom
router.route('/create').post(authenticateJWT, createUser);
router.route('/getUsers').get(authenticateJWT, getUsers);
router.route('/updateUser').put(authenticateJWT, updateUser);
router.route('/updateRole').put(authenticateJWT, updateRole);
router.route('/deleteUser').delete(authenticateJWT, deleteUser);

export default router;

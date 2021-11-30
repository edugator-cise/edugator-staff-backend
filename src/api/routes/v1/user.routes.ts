import * as express from 'express';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser
} from '../../controllers/user.controller';
import { authenticateJWT } from '../../middlewares/auth';
import { checkRolePrivileges } from '../../middlewares/roles';
const router = express.Router();

// TODO: Separate top and bottom
router.route('/create').post(authenticateJWT, checkRolePrivileges, createUser);
router.route('/getUsers').get(authenticateJWT, checkRolePrivileges, getUsers);
router
  .route('/updateUser')
  .put(authenticateJWT, checkRolePrivileges, updateUser);
// router.route('/updateRole').put(authenticateJWT, updateRole);
router
  .route('/deleteUser')
  .delete(authenticateJWT, checkRolePrivileges, deleteUser);

export default router;

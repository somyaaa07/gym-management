import express from 'express';
import * as UserController from './user.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('SUPER_ADMIN','ADMIN'),UserController.createUser);

router.get('/',authMiddleware,tenantMiddleware,roleMiddleware('SUPER_ADMIN','ADMIN'),UserController.getAllUsers);
router.get('/:id',authMiddleware,tenantMiddleware,roleMiddleware('SUPER_ADMIN','ADMIN'),UserController.getUserById);
router.get('/branch/:id',authMiddleware,tenantMiddleware,roleMiddleware('SUPER_ADMIN','ADMIN'),UserController.getUserByBranch);

router.delete('/:id',authMiddleware,tenantMiddleware,roleMiddleware('ADMIN'),UserController.deleteUser);
router.patch('/:id',authMiddleware,tenantMiddleware,roleMiddleware('SUPER_ADMIN','ADMIN'),UserController.updateUser);


export default router;
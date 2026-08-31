import express from 'express';
import * as UserController from './user.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('SUPER_ADMIN'),UserController.createUser);

export default router;
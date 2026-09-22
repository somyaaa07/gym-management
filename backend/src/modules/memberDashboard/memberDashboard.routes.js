import express from 'express';

import * as MemberDashboardController from "./memberDashboard.controller.js";

import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router =  express.Router();

router.get(
    '/', authMiddleware,roleMiddleware ("Member"), MemberDashboardController.getMemberDashboard
)

export default router;
 

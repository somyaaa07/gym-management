import express from 'express';

import * as MemberDashboardController from "./memberDashboard.controller.js";

import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import { tenantMiddleware} from '../../middleware/tenant.middleware.js';

const router =  express.Router();

router.get(
    '/', authMiddleware, tenantMiddleware,roleMiddleware ("MEMBER"), MemberDashboardController.getMemberDashboard
)

export default router;
 

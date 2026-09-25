import express from 'express';

import * as MemberDashboardController from "./memberDashboard.controller.js";

import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import { tenantMiddleware} from '../../middleware/tenant.middleware.js';

const router =  express.Router();

router.get(
    '/', authMiddleware, tenantMiddleware,roleMiddleware ("MEMBER"), MemberDashboardController.getMemberDashboard
)
router.get("/my-attendance",authMiddleware,tenantMiddleware,roleMiddleware("MEMBER"), MemberDashboardController.getMyAttendance);

router.get("/my-goals",authMiddleware,tenantMiddleware,roleMiddleware("MEMBER"), MemberDashboardController.getMyGoals);
router.get("/my-goals-log",authMiddleware,tenantMiddleware,roleMiddleware("MEMBER"), MemberDashboardController.logMyGoalProgress);

// NEW: self-service diet plan / workout plan (read side)
router.get("/my-diet-plan",authMiddleware,tenantMiddleware,roleMiddleware("MEMBER"), MemberDashboardController.getMyDietPlans);
router.get("/my-workout-plan",authMiddleware,tenantMiddleware,roleMiddleware("MEMBER"), MemberDashboardController.getMyWorkoutPlans);

router.get("/my-membership", authMiddleware,tenantMiddleware,roleMiddleware("MEMBER"), MemberDashboardController.getMyMembership);

export default router;
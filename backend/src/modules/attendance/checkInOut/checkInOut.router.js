import express from 'express'
import * as checkInOutController from './checkInOut.controller.js';
import {authMiddleware} from '../../../modules/auth/auth.middleware.js';
import {roleMiddleware} from  '../../../middleware/role.middleware.js'

const router = express.Router();

router.post('/checkin',authMiddleware,roleMiddleware('ADMIN','MANAGER','RECEPTIONIST'),checkInOutController.checkIn);
router.post('/checkout',authMiddleware,roleMiddleware('ADMIN','MANAGER','RECEPTIONIST'),checkInOutController.checkOut);

router.get('/attendance-history',authMiddleware,roleMiddleware('ADMIN','MANAGER','RECEPTIONIST','BRANCH_ADMIN'),checkInOutController.getAttendanceHistory);
export default router;
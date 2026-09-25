import express from 'express';
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';
import * as memberSlotController from './memberSlot.controller.js';

const router = express.Router();

router.post('/' , authMiddleware, roleMiddleware('ADMIN','BRANCH_ADMIN'), memberSlotController.createMemberSlot);
router.get('/:member_id', authMiddleware, roleMiddleware('ADMIN',"BRANCH_ADMIN"), memberSlotController.getMemberSlots);
router.put('/:member_id', authMiddleware, roleMiddleware('ADMIN',"BRANCH_ADMIN"), memberSlotController.updateMemberSlot);

export default router;

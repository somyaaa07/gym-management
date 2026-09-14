import express from 'express';
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';
import * as memberSlotController from './memberSlot.controller.js';

const router = express.Router();

router.post('/' , authMiddleware, roleMiddleware('admin'), memberSlotController.createMemberSlot);
router.get('/', authMiddleware, roleMiddleware('admin'), memberSlotController.getMemberSlots);
router.put('/:id', authMiddleware, roleMiddleware('admin'), memberSlotController.updateMemberSlot);

export default router;

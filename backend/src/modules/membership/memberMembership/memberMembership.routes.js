import express from 'express'
import * as memberMembershipController from './memberMembership.controller.js'
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.createMemberMembership);

router.get('/',authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.getAllMemberships);
router.get('/member/:member_id' ,authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.getMemberMemberships)
router.get('/:id',authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.getMemberMembershipById);

router.patch('/:id',authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.updateMemberMembership);

router.patch('/:id/deactivate',authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.deactivateMemberMembership)

export default router
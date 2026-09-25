import express from 'express'
import * as memberMembershipController from './memberMembership.controller.js'
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN', 'BRANCH_ADMIN'),memberMembershipController.createMemberMembership);

router.get('/',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberMembershipController.getAllMemberships);
router.get('/member/:member_id' ,authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberMembershipController.getMemberMemberships)
router.get('/:id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberMembershipController.getMemberMembershipById);

router.patch('/:id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberMembershipController.updateMemberMembership);

router.patch('/:id/deactivate',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberMembershipController.deactivateMemberMembership);
router.patch(
    '/:id/freeze',
    authMiddleware,
    roleMiddleware('ADMIN', 'BRANCH_ADMIN'),
    memberMembershipController.freezeMemberMembership
);
// router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),memberMembershipController.deleteMemberMembership);

export default router
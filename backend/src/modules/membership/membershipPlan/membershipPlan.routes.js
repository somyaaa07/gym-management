import express from 'express';
import * as membershipPlanCOntroller from './membershipPlan.controller.js';
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/' , authMiddleware,roleMiddleware('ADMIN'),membershipPlanCOntroller.createMembershipPlan);

router.get('/',authMiddleware,roleMiddleware('ADMIN'),membershipPlanCOntroller.getAllMembershipPlans);
router.get('/:id',authMiddleware,roleMiddleware('ADMIN'),membershipPlanCOntroller.getMembershipPlanById);
router.put('/:id',authMiddleware,roleMiddleware('ADMIN'),membershipPlanCOntroller.updateMembershipPlan);
router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),membershipPlanCOntroller.deleteMembershipPlan);


export default router;
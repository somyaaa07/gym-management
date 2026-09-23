import express from 'express';
import * as memberController from './member.controller.js';
import { authMiddleware } from '../../auth/auth.middleware.js';
import {roleMiddleware} from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberController.createMember);
router.post("/set-password", memberController.setPassword);

router.get('/',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberController.getAllMember);
router.get('/branch/:id', authMiddleware, roleMiddleware('ADMIN','BRANCH_ADMIN'), memberController.getBranchMembers);
router.get('/branch/:branch_id/member/:member_id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberController.getBranchMemberById);
router.get('/:id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberController.getMemberById);

router.put('/:id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberController.updateMember);

router.delete('/:id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'),memberController.deleteMember);

export default router;
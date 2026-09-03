import express from 'express';
import * as memberController from './member.controller.js';
import { authMiddleware } from '../../auth/auth.middleware.js';
import {roleMiddleware} from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN'),memberController.createMember);

router.get('/',authMiddleware,roleMiddleware('ADMIN'),memberController.getAllMember);
router.get('/branch/:id', authMiddleware, roleMiddleware('ADMIN'), memberController.getBranchMembers);
router.get('/branch/:branch_id/member/:member_id',authMiddleware,roleMiddleware('ADMIN'),memberController.getBranchMemberById);
router.get('/:id',authMiddleware,roleMiddleware('ADMIN'),memberController.getMemberById);

router.put('/:id',authMiddleware,roleMiddleware('ADMIN'),memberController.updateMember);

router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),memberController.deleteMember);

export default router;
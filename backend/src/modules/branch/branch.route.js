import express from 'express';
import * as branchController from './branch.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,tenantMiddleware,roleMiddleware('ADMIN'),branchController.createBranch);
router.get('/',authMiddleware,tenantMiddleware,roleMiddleware('ADMIN'),branchController.getAllBranches);
router.get('/:id',authMiddleware,tenantMiddleware,roleMiddleware('ADMIN'),branchController.getBranchById);
router.delete('/:id',authMiddleware,tenantMiddleware,roleMiddleware('ADMIN'),branchController.deleteBranch);
router.patch('/:id',authMiddleware,tenantMiddleware,roleMiddleware('ADMIN'),branchController.updateBranch);

export default router;
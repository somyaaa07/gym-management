import express from 'express';
import * as TenantController from './tenant.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('SUPER_ADMIN'),TenantController.createTenant);
router.get('/me' , authMiddleware,tenantMiddleware,TenantController.getTenant);

export default router;
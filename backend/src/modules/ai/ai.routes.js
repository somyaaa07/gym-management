import express from 'express';
import * as aiController from './ai.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = express.Router();

router.get('/models', authMiddleware, roleMiddleware('ADMIN'), aiController.getModels);
router.post('/suggest', authMiddleware, roleMiddleware('ADMIN'), aiController.suggestPlan);

export default router;

import express from 'express';
import * as healthProfileController from './healthProfile.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN'),healthProfileController.createHealthProfile);

router.get('/',authMiddleware,healthProfileController.getAllHealthProfiles);
router.get('/branch/:id',authMiddleware,healthProfileController.getHealthProfilesOnBranch);
router.get('/:id',authMiddleware,healthProfileController.getHealthProfileById);

router.patch('/:id',authMiddleware,roleMiddleware('ADMIN'),healthProfileController.updateHealthProfile);
router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),healthProfileController.deleteHealthProfile);

export default router;
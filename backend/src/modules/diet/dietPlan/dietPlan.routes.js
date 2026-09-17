import express from 'express';
import * as dietPlanController from './dietPlan.controller.js';
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware("ADMIN"), dietPlanController.createDietPlan);

router.get('/',authMiddleware,roleMiddleware('ADMIN'),dietPlanController.getAllDietPlans);

router.get('/:id',authMiddleware,roleMiddleware('ADMIN'),dietPlanController.getDietPlanById);

router.put('/:id',authMiddleware,roleMiddleware('ADMIN'),dietPlanController.updateDietPlan);

router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),dietPlanController.deleteDietPlan);

export default router;
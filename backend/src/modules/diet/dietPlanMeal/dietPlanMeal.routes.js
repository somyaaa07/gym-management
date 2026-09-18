import express from 'express'
import {authMiddleware} from '../../auth/auth.middleware.js';
import {roleMiddleware} from '../../../middleware/role.middleware.js';
import * as dietPlanMealController from './dietPlanMeal.controller.js';

const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN'),dietPlanMealController.createDietPlanMeal);

router.get('/',authMiddleware,roleMiddleware('ADMIN'),dietPlanMealController.getAllDietPlanMeals);
router.get('/:id',authMiddleware,roleMiddleware('ADMIN'),dietPlanMealController.getDietPlanMealById);

router.put('/:id',authMiddleware,roleMiddleware('ADMIN'),dietPlanMealController.updatedDietPlanMeal);

router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),dietPlanMealController.deleteDietPlanMeal);

export default router;
import express from 'express';
import * as workoutPlanController from './workoutPlan.controller.js'
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/',authMiddleware, roleMiddleware('ADMIN','TRAINER'), workoutPlanController.createWorkout);

router.get('/',authMiddleware,roleMiddleware('ADMIN','TRAINER','MEMBER'), workoutPlanController.getAllWorkoutPlans);
router.get('/:id',authMiddleware,roleMiddleware('ADMIN','TRAINER','MEMBER'), workoutPlanController.getWorkoutPlanById);

router.patch('/:id',authMiddleware,roleMiddleware('ADMIN','TRAINER'), workoutPlanController.updateWorkoutPlan);
router.delete('/:id',authMiddleware,roleMiddleware('ADMIN','TRAINER'), workoutPlanController.deleteWorkoutPlan);


export default router;
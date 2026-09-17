import express from 'express';
import * as workoutPlanExerciseController from './workoutPlanExercise.controller.js';
import { authMiddleware } from '../../auth/auth.middleware.js';
import { roleMiddleware } from '../../../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('ADMIN','TRAINER'), workoutPlanExerciseController.createWorkoutPlanExercise);

router.get('/', authMiddleware, roleMiddleware('ADMIN','TRAINER'), workoutPlanExerciseController.getAllWorkoutPlanExercise);

router.get('/:id', authMiddleware, roleMiddleware('ADMIN','TRAINER'), workoutPlanExerciseController.getWorkOutPlanExerciseById);

router.patch('/:id', authMiddleware, roleMiddleware('ADMIN','TRAINER'), workoutPlanExerciseController.updateWorkoutPlanExercise);

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN','TRAINER'), workoutPlanExerciseController.deleteWorkoutPlanExercise);

export default router

import express from 'express';
import * as exerciseController from './exercise.controller.js';
import {authMiddleware} from '../auth/auth.middleware.js';
import {roleMiddleware} from '../../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('ADMIN'), exerciseController.createExercise);

router.get('/', authMiddleware, roleMiddleware('ADMIN', 'TRAINER'), exerciseController.getAllExercise);

router.get('/:id', authMiddleware, roleMiddleware('ADMIN', 'TRAINER','MEMBER'), exerciseController.getExerciseById);

router.patch('/:id', authMiddleware, roleMiddleware('ADMIN'), exerciseController.updateExercise);

router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), exerciseController.deleteExercise);

export default router;
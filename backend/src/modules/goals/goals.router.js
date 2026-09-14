import express from 'express';
import * as goalController from './goals.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = express.Router();

router.post('/' , authMiddleware, roleMiddleware('ADMIN'), goalController.createGoal);

router.get('/', authMiddleware, roleMiddleware('ADMIN'), goalController.getAllGoals);
router.get('/branch/:branch_id',authMiddleware,roleMiddleware('ADMIN'), goalController.getBranchGoals);
router.get('/:id' , authMiddleware , roleMiddleware('ADMIN'), goalController.getGoalsById);

router.patch('/:id' , authMiddleware ,roleMiddleware('ADMIN'), goalController.updateGoals);
router.delete('/:id' , authMiddleware , roleMiddleware('ADMIN'), goalController.deleteGoal);


export default router;
import express from 'express';
import * as goalController from './goals.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';

const router = express.Router();

router.post('/' , authMiddleware, roleMiddleware('ADMIN','MEMBER'), goalController.createGoal);

router.get('/', authMiddleware, roleMiddleware('ADMIN'), goalController.getAllGoals);
router.get('/branch/:branch_id',authMiddleware,roleMiddleware('ADMIN','BRANCH_ADMIN'), goalController.getBranchGoals);
router.get('/:id' , authMiddleware , roleMiddleware('ADMIN','MEMBER','BRANCH_ADMIN'), goalController.getGoalsById);

router.patch('/:id' , authMiddleware ,roleMiddleware('ADMIN','MEMBER'), goalController.updateGoals);
router.delete('/:id' , authMiddleware , roleMiddleware('ADMIN','BRANCH_ADMIN'), goalController.deleteGoal);


export default router;
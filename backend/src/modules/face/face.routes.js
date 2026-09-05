import express from 'express';
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';
import * as faceController from './face.controller.js'

const router = express.Router();

router.post('/verify',authMiddleware,faceController.verifyFaceId);
router.post('/:id',authMiddleware,roleMiddleware('ADMIN'),faceController.createFaceId);

export default router;
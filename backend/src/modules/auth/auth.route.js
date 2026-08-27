import express from 'express'
import * as AuthController from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';


const router = express.Router();
// router.post('/register',AuthController.register)
router.post('/register',AuthController.register);
router.post('/login', AuthController.login);

router.get('/me',authMiddleware,AuthController.getMe);
export default router;
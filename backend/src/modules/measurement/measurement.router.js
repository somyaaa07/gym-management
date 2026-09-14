import express from 'express'
import * as measurementController from './measurement.controller.js'
import { authMiddleware } from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';


const router = express.Router();

router.post('/',authMiddleware,roleMiddleware('ADMIN'),measurementController.createMeasurement);

router.get('/',authMiddleware,roleMiddleware('ADMIN'), measurementController.getAllMeasurements);
router.get('/branch/:branch_id',authMiddleware,roleMiddleware('ADMIN'),measurementController.getMeasurementByBranch);
router.get('/:id',authMiddleware,roleMiddleware('ADMIN'),measurementController.getMeasurementById);

router.patch('/:id',authMiddleware,roleMiddleware('ADMIN'),measurementController.updateMeasurementById);
router.delete('/:id',authMiddleware,roleMiddleware('ADMIN'),measurementController.deleteMeasurementById);


export default router;

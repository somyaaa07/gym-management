import express from 'express'
import * as measurementController from './measurement.controller.js'
import {auth} from '../auth/auth.middleware.js';
import { roleMiddleware } from '../../middleware/role.middleware.js';


const router = express.Router();

router.post('/',auth,roleMiddleware('ADMIN'),measurementController.createMeasurement);

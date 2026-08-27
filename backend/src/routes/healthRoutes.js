import express from 'express'
import health from '../controllers/healthController.js'

const router = express.Router()

//health check
router.get('/',health);

export default router
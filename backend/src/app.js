import express from 'express';
import cors from 'cors';
import helmet from 'helmet'
import morgan from 'morgan';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './modules/auth/auth.route.js';

const app = express()
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


app.use('/api/v1/health',healthRoutes);
app.use('/api/v1/auth',authRoutes);

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet'
import morgan from 'morgan';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './modules/auth/auth.route.js';
import tenantRoutes from './modules/tenant/tenant.route.js';
import userRoutes from './modules/user/user.route.js';
import branchRoutes from './modules/branch/branch.route.js';
import membershipRoutes from './modules/membership/membershipPlan/membershipPlan.routes.js'
import memberMembershipRoutes from './modules/membership/memberMembership/memberMembership.routes.js'
import members from './modules/membership/member/member.routes.js';
import memberFaceId from './modules/face/face.routes.js' ;

const app = express()
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


app.use('/api/v1/health',healthRoutes);
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/tenant',tenantRoutes);
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/branches',branchRoutes);
app.use('/api/v1/members',members)
app.use('/api/v1/membership',membershipRoutes);
app.use('/api/v1/member-membership',memberMembershipRoutes);
app.use('/api/v1/member-faceId',memberFaceId);


export default app;

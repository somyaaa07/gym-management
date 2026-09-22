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
import memberMembershipRoutes from './modules/membership/memberMembership/memberMembership.routes.js';
import members from './modules/membership/member/member.routes.js';
import memberDashboardRoutes from './modules/memberDashboard/memberDashboard.routes.js';
import memberFaceId from './modules/face/face.routes.js' ;
import healthProfile from './modules/healthProfiles/healthProfile.routes.js';
import measurementRoutes from './modules/measurement/measurement.router.js';
import goalsRoute from './modules/goals/goals.router.js';
import memberSlotRoutes from './modules/attendance/memberSlot/memberSlot.router.js';
import attendanceRuleRoutes from './modules/attendance/attendanceRule/attendanceRule.router.js';
import checkInOutRoutes from './modules/attendance/checkInOut/checkInOut.router.js';
import exerciseRoutes from './modules/exercise/exercise.route.js';
import workoutPlanRutes from './modules/workout/workoutplan/workoutPlan.routes.js';
import workoutPlanExercise from './modules/workout/workoutplanexercise/workoutPlanExercise.routes.js';
import DietPlan from './modules/diet/dietPlan/dietPlan.routes.js';
import DietPlanMealRoutes from './modules/diet/dietPlanMeal/dietPlanMeal.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

const app = express()
app.use(express.json({limit: '50mb'}));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


app.use('/api/v1/health',healthRoutes);
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/tenant',tenantRoutes);
app.use('/api/v1/users',userRoutes);
app.use('/api/v1/branches',branchRoutes);
app.use('/api/v1/members',members);
app.use('/api/v1/member-dashboard',memberDashboardRoutes);
app.use('/api/v1/membership',membershipRoutes);
app.use('/api/v1/member-membership',memberMembershipRoutes);
app.use('/api/v1/member-faceId',memberFaceId);
app.use('/api/v1/health-profile',healthProfile);
app.use('/api/v1/measurements',measurementRoutes);
app.use('/api/v1/goals',goalsRoute);
app.use('/api/v1/member-slot',memberSlotRoutes);
app.use('/api/v1/attendance-rule',attendanceRuleRoutes);
app.use('/api/v1/attendance',checkInOutRoutes);
app.use('/api/v1/exercise',exerciseRoutes);
app.use('/api/v1/workout-plan',workoutPlanRutes);
app.use('/api/v1/workout-plan-exercise',workoutPlanExercise);
app.use('/api/v1/diet-plan',DietPlan);
app.use('/api/v1/diet-plan-meal',DietPlanMealRoutes);
app.use('/api/v1/ai',aiRoutes);


export default app;

// import { sequelize } from '../config/database.js';
import Tenant from './tenantModel.js';
import User from './userModel.js';
import Branch from './branchModel.js';
import MembershipPlan from './membershipPlanModel.js';
import Member from './memberModel.js';
import MemberMembership from './memberMembershipModel.js';
import MemberFaceId from './memberFaceModel.js';
import HealthProfile from './healthProfileModel.js';
import Measurement from './measurementModel.js';
import Goal from './goalsModel.js';
import Attendance from './attendanceModel.js';
import AttendanceRule from './attendanceRulesModel.js';
import MemberSlots from './memberSlotsModel.js';
import Exercise from './exerciseModel.js';
import WorkoutPlan from './workoutPlanModel.js';
import WorkoutPlanExercise from './woroutPlanExerciseModel.js';

Tenant.hasMany(Branch,{foreignKey:"tenant_id"});
Branch.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(User,{foreignKey:"tenant_id"});
User.belongsTo(Tenant,{foreignKey:"tenant_id"});

Branch.hasMany(User,{foreignKey:"branch_id"});
User.belongsTo(Branch,{foreignKey:"branch_id"});

Tenant.hasMany(MembershipPlan,{foreignKey:"tenant_id"});
MembershipPlan.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(Member,{foreignKey:"tenant_id"});
Member.belongsTo(Tenant,{foreignKey:"tenant_id"});

Branch.hasMany(Member,{foreignKey:"branch_id"});
Member.belongsTo(Branch,{foreignKey:"branch_id"})

Tenant.hasMany(MemberMembership,{foreignKey:"tenant_id"});
MemberMembership.belongsTo(Tenant,{foreignKey:"tenant_id"});

Member.hasMany(MemberMembership,{foreignKey:"member_id"});
MemberMembership.belongsTo(Member,{foreignKey:"member_id"});

MembershipPlan.hasMany(MemberMembership,{foreignKey:"membership_plan_id"});
MemberMembership.belongsTo(MembershipPlan,{foreignKey:"membership_plan_id"});

Member.belongsToMany(MembershipPlan,{
    through:MemberMembership,
    foreignKey:"member_id",
    otherKey:"membership_plan_id"
});

Member.hasOne(MemberFaceId,{foreignKey:"member_id"});
MemberFaceId.belongsTo(Member,{foreignKey:"member_id"});

// one tenant has n number of memberfaceId and one memberfaceId belongs to one tenant
Tenant.hasMany(MemberFaceId,{foreignKey:"tenant_id"});
MemberFaceId.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(HealthProfile,{foreignKey:"tenant_id"});
HealthProfile.belongsTo(Tenant,{foreignKey:"tenant_id"});

Branch.hasMany(HealthProfile,{foreignKey:'branch_id'});
HealthProfile.belongsTo(Branch,{foreignKey:'branch_id'});

Member.hasOne(HealthProfile,{foreignKey:"member_id"});
HealthProfile.belongsTo(Member,{foreignKey:"member_id"});

Tenant.hasMany(Measurement,{foreignKey:"tenant_id"});
Measurement.belongsTo(Tenant,{foreignKey:"tenant_id"});

Branch.hasMany(Measurement,{foreignKey:"branch_id"});
Measurement.belongsTo(Branch,{foreignKey:"branch_id"});

Member.hasMany(Measurement,{foreignKey:"member_id"});
Measurement.belongsTo(Member,{foreignKey:"member_id"});

Tenant.hasMany(Goal,{foreignKey:"tenant_id"});
Goal.belongsTo(Tenant,{foreignKey:"tenant_id"});

Branch.hasMany(Goal,{foreignKey:"branch_id"});
Goal.belongsTo(Branch,{foreignKey:"branch_id"});

Member.hasMany(Goal,{foreignKey:"member_id"});
Goal.belongsTo(Member,{foreignKey:"member_id"});

Member.hasMany(MemberSlots,{foreignKey:'member_id'});
MemberSlots.belongsTo(Member,{foreignKey:'member_id'});

Member.hasMany(Attendance,{foreignKey:'member_id'});
Attendance.belongsTo(Member,{foreignKey:'member_id'});

Branch.hasMany(Attendance,{foreignKey:'branch_id'});
Attendance.belongsTo(Branch,{foreignKey:'branch_id'});

User.hasMany(Attendance,{foreignKey:'verified_by'});
Attendance.belongsTo(User,{foreignKey:'verified_by', as:'verifiedByUser' });

Tenant.hasMany(Exercise,{foreignKey:'tenant_id'});
Exercise.belongsTo(Tenant,{foreignKey:'tenant_id'});

Tenant.hasMany(WorkoutPlan,{foreignKey:'tenant_id'});
WorkoutPlan.belongsTo(Tenant,{foreignKey:'tenant_id'});

Member.hasMany(WorkoutPlan,{foreignKey:'member_id'});
WorkoutPlan.belongsTo(Member,{foreignKey:'member_id'});

Branch.hasMany(WorkoutPlan,{foreignKey:'branch_id'});
WorkoutPlan.belongsTo(Branch,{foreignKey:'branch_id'});

WorkoutPlan.hasMany(WorkoutPlanExercise,{foreignKey:'workout_plan_id'});
WorkoutPlanExercise.belongsTo(WorkoutPlan,{foreignKey:'workout_plan_id'});

Exercise.hasMany(WorkoutPlanExercise,{foreignKey:'exercise_id'});
WorkoutPlanExercise.belongsTo(Exercise,{foreignKey:'exercise_id'});




export {
    Tenant,
    Branch,
    User,
    MembershipPlan,
    Member,
    MemberMembership,
    MemberFaceId,
    HealthProfile,
    Measurement,
    Goal,
    Attendance,
    MemberSlots,
    AttendanceRule,
    Exercise,
    WorkoutPlan,
    WorkoutPlanExercise
}
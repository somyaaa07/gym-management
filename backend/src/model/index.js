// import { sequelize } from '../config/database.js';
import Tenant from './tenantModel.js';
import User from './userModel.js';
import Branch from './branchModel.js';
import MembershipPlan from './membershipPlanModel.js';
import Member from './memberModel.js';
import MemberMembership from './memberMembershipModel.js';
import MemberFaceId from './memberFaceModel.js';

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



export {
    Tenant,
    Branch,
    User,
    MembershipPlan,
    Member,
    MemberMembership,
    MemberFaceId
}
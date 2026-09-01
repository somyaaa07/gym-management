// import { sequelize } from '../config/database.js';
import Tenant from './tenantModel.js';
import User from './userModel.js';
import Branch from './branchModel.js';
import MembershipPlan from './membershipPlanModel.js';
import Member from './memberModel.js';

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

// Member.hasMany(MembershipPlan,{foreignKey:"member_id"});
// MembershipPlan.belongsTo(Member,{foreignKey:"member_id"});



export {
    Tenant,
    Branch,
    User,
    MembershipPlan,
    Member
}
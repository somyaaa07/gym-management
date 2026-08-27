// import { sequelize } from '../config/database.js';
import Tenant from './tenantModel.js';
import User from './userModel.js';
import Branch from './branchModel.js';

Tenant.hasMany(Branch,{foreignKey:"tenant_id"});
Branch.belongsTo(Tenant,{foreignKey:"tenant_id"});

Tenant.hasMany(User,{foreignKey:"tenant_id"});
User.belongsTo(Tenant,{foreignKey:"tenant_id"});

Branch.hasMany(User,{foreignKey:"branch_id"});
User.belongsTo(Branch,{foreignKey:"branch_id"});


export {
    Tenant,
    Branch,
    User
}
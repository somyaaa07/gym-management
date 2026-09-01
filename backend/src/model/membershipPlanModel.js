import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class MembershipPlan extends Model {}

MembershipPlan.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    duration:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    duration_unit:{
        type:DataTypes.ENUM('DAYS','WEEKS','MONTHS','YEARS'),
        allowNull:false
    },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
},

discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
},
   access_type: {
    type: DataTypes.ENUM(
        'SINGLE_BRANCH',
        'ALL_BRANCHES'
    ),
    allowNull: false,
    defaultValue: 'SINGLE_BRANCH'
},
    status:{
        type:DataTypes.ENUM('ACTIVE','INACTIVE'),
        allowNull:false,
        defaultValue:'ACTIVE'
    }

},{
    sequelize,
    modelName:'MembershipPlan',
    tableName:'membership_plans',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'

})

export default MembershipPlan;
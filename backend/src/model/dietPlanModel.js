import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class DietPlan extends Model{}

DietPlan.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
    },
    member_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    description:{
        type:DataTypes.STRING,
        allowNull:true
    },
    goal:{
        type:DataTypes.STRING,
        allowNull:false
    },
    start_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    end_date:{
        type:DataTypes.DATEONLY,
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('ACTIVE','INACTIVE','COMPLETED'),
        defaultValue:'ACTIVE',
        allowNull:false
    }
},{
    sequelize,
    modelName:"DietPlan",
    tableName:"diet_plans",
    timestamps:true,
    createdAt:"created_at",
    updatedAt:"updated_at"
})

export default DietPlan
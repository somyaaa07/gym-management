import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class WorkoutPlan extends Model{}

WorkoutPlan.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    member_id:{
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

    status: {
  type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'COMPLETED'),
  allowNull: false,
  defaultValue: 'ACTIVE'
}
},{
    sequelize,
    modelName:"WorkoutPlan",
    tableName:"workout_plans",
    timestamps:true,
    createdAt:"created_at",
    updatedAt:"updated_at"
})

export default WorkoutPlan;
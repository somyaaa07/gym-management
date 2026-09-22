import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class AIGenerationLog extends Model {}

AIGenerationLog.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        allowNull:false
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    member_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    goal_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    type:{
        type:DataTypes.ENUM('WORKOUT_DIET_PLAN','PROGRESS_INSIGHT'),
        allowNull:false
    },
    status:{
        type:DataTypes.ENUM('SUCCESS','FAILED'),
        allowNull:false,
        defaultValue:'SUCCESS'
    },
    workout_plan_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    diet_plan_id:{
        type:DataTypes.UUID,
        allowNull:true
    },
    request_summary:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    ai_response:{
        type:DataTypes.TEXT('long'),
        allowNull:true
    },
    error_message:{
        type:DataTypes.TEXT,
        allowNull:true
    }
},{
    sequelize,
    modelName:'AIGenerationLog',
    tableName:'ai_generation_logs',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'
})

export default AIGenerationLog;
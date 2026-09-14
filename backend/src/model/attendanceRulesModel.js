import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class AttendanceRule extends Model {}

AttendanceRule.init({
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    grace_period_minutes:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:10
    },
    early_leave_threshold_minutes:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:15
    }

},{
    sequelize,
    modelName:'AttendanceRule',
    tableName:'attendance_rules',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'
})

export default AttendanceRule;
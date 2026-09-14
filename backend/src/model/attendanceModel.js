import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Attendance extends Model{}
Attendance.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    tenant_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    member_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    branch_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    check_in_time:{
        type:DataTypes.DATE,
        allowNull:false
    },
    check_out_time:{
        type:DataTypes.DATE,
        allowNull:true
    },
    check_in_method:{
        type:DataTypes.ENUM('MANUAL','FACE'),
        allowNull:false,
    },
    check_out_method:{
        type:DataTypes.ENUM('MANUAL','FACE'),
        allowNull:true,
  
    },
    check_in_status:{
        type:DataTypes.ENUM('ON_TIME','LATE'),
        allowNull:false,
    },
    check_out_status:{
        type:DataTypes.ENUM('ON_TIME','EARLY_LEAVE'),
        allowNull:true,
    },
    verified_by:{
        type:DataTypes.UUID,
        allowNull:true
    }  
},{
    sequelize,
    modelName:'Attendance',
    tableName:'attendances',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'
})

export default Attendance
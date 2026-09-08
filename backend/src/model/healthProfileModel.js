import { DataTypes,Model } from "sequelize";
import {sequelize} from '../config/database.js';

class HealthProfile extends Model{}

HealthProfile.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        
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
        allowNull:false,
        unique:true
    },
    blood_group:{
        type:DataTypes.ENUM("A+","B+","O+","AB+","A-","B-","O-","AB-"),
       
        allowNull:true
    },
    medical_condition:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    allergies:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    current_medication:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    injury_history:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    exercise_restriction:{
        type:DataTypes.TEXT,
        allowNull:true

    },
    doctor_clearance:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull:true
    },
    doctor_notes:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    health_risk_level:{
        type:DataTypes.ENUM("LOW","MEDIUM","HIGH"),
        allowNull:true
    },
    

},{
    sequelize,
    modelName:"healthProfile",
    tableName:"health_profiles",
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'
}
)

export default HealthProfile
import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Measurement extends Model{}

Measurement.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
        // unique:true
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
    height:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:false
    },
    weight:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:false
    },
    bmi:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
 
    // hip:{
    //     type:DataTypes.DECIMAL(5,2),
    //     allowNull:false
    // },
    body_fat:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
    muscle_mass:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
       waist:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
    chest:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
    arms:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
    thighs:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
    
    neck:{
        type:DataTypes.DECIMAL(5,2),
        allowNull:true
    },
    

    systolic_bp:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    diastolic_bp:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    

    measured_at:{
        type:DataTypes.DATE,
        allowNull:false
    }

},{
    sequelize,
    modelName:'Measurement',
    tableName:'measurements',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'
})
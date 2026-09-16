import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class Exercise extends Model{}

Exercise.init({
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
        allowNull:false
    },
    category:{
        type:DataTypes.ENUM(
            'STRENGTH',
            'CARDIO',
            'FLEXIBILITY',
            'MOBILITY'
        ),
        allowNull:false,
        defaultValue:'STRENGTH'
    },
    muscle_group:{
        type:DataTypes.ENUM(
            'CHEST',
            'BACK',
            'SHOULDERS',
            'BICEPS',
            'TRICEPS',
            'LEGS',
            'GLUTES',
            'ABS',
            'FULL_BODY'
        ),
        allowNull:false
    },
    equipment:{
        type:DataTypes.STRING,
        allowNull:false,
        // required:true
    },
    difficulty:{
        type:DataTypes.ENUM(
            'BEGINNER',
            'INTERMEDIATE',
            'ADVANCED'
        ),
        allowNull:false,
        defaultValue:'BEGINNER'
    },
    instructions:{
        type:DataTypes.TEXT,
        allowNull:false
    },
    video_url:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.ENUM('ACTIVE','INACTIVE'),
        allowNull:false,
        defaultValue:'ACTIVE',
    }
},{
    sequelize,
    modelName:'Exercise',
    tableName:'exercises',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'
})

export default Exercise;
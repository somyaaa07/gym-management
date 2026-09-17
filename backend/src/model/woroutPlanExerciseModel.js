import { DataTypes , Model } from "sequelize";
import {sequelize} from '../config/database.js';

class WorkoutPlanExercise extends Model {}

WorkoutPlanExercise.init({
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true,
    },
    workout_plan_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    exercise_id:{
        type:DataTypes.UUID,
        allowNull:false,
    },
    day:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    sets:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    reps:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    duration:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    rest_seconds:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    notes:{
        type:DataTypes.TEXT,
        allowNull:true,
    }
},
{
    sequelize,
    modelName:'WorkoutPlanExercise',
    tableName:'workout_plan_exercises',
    timestamps:true,
    createdAt:'created_at',
    updatedAt:'updated_at'

})

export default WorkoutPlanExercise
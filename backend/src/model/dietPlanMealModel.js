import { DataTypes,Model } from "sequelize";
import { sequelize } from "../config/database.js";

class DietPlanMeal extends Model {}

DietPlanMeal.init({
    id:{
        type:DataTypes.UUID,
        primaryKey:true,
        defaultValue:DataTypes.UUIDV4,
    },
    diet_plan_id:{
        type:DataTypes.UUID,
        allowNull:false
    },
    meal_type:{
        type:DataTypes.STRING,
        allowNull:false
    },
    meal_time:{
        type:DataTypes.TIME,
        allowNull:false
    },
    food_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    quantity:{
        type:DataTypes.DECIMAL,
        allowNull:false
    },
    unit:{
        type:DataTypes.STRING,
        allowNull:false
    },
    calories:{
        type:DataTypes.DECIMAL,
        allowNull:true
    },
    protein:{
        type:DataTypes.DECIMAL,
        allowNull:true
    },
    fat:{
        type:DataTypes.DECIMAL,
        allowNull:true
    },
    carbs:{
        type:DataTypes.DECIMAL,
        allowNull:true
    },
    fiber:{
        type:DataTypes.DECIMAL,
        allowNull:true
    },
    sugar:{
        type:DataTypes.DECIMAL,
        allowNull:true
    },
    notes:{
        type:DataTypes.TEXT,
        allowNull:true

    }
},{
    sequelize,
    modelName:"DietPlanMeal",
    tableName:"diet_plan_meals",
    timestamps:true,
    createdAt:"created_at",
    updatedAt:"updated_at"
})

export default DietPlanMeal;
import {z} from 'zod';

export const createDietPlanMealSchema = z.object({
    diet_plan_id:z.uuid(),
    meal_type:z.string().min(1,"Meal type is required").max(50,"Meal type must be less than 50 characters"),
    meal_time:z.number().min(1,"Meal time is required").max(50,"Meal time must be less than 50 characters"),
    food_name:z.string().min(1,"Food name is required").max(50,"Food name must be less than 50 characters"),
    quantity:z.number().min(1,"Quantity is required").max(50,"Quantity must be less than 50 characters"),
    unit:z.string().min(1,"Unit is required").max(50,"Unit must be less than 50 characters"),
    calories:z.number().min(1,"Calories is required").max(50,"Calories must be less than 50 characters").optional(),
    protein:z.number().min(1,"Protein is required").max(50,"Protein must be less than 50 characters").optional(),
    fat:z.number().min(1,"Fat is required").max(50,"Fat must be less than 50 characters").optional(),
    carbs:z.number().min(1,"Carbs is required").max(50,"Carbs must be less than 50 characters").optional(),
    fiber:z.number().min(1,"Fiber is required").max(50,"Fiber must be less than 50 characters").optional(),
    sugar:z.number().min(1,"Sugar is required").max(50,"Sugar must be less than 50 characters").optional(),
    
})
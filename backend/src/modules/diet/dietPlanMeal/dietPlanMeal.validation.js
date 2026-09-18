import { z } from 'zod';

export const createDietPlanMealSchema = z.object({
    diet_plan_id: z.uuid(),
    meal_type: z.string().min(1, "Meal type is required").max(50, "Meal type must be less than 50 characters"),
    meal_time: z.string().min(1, "Meal time is required").max(50, "Meal time must be less than 50 characters"),
    food_name: z.string().min(1, "Food name is required").max(50, "Food name must be less than 50 characters"),
    quantity: z.number().positive("Quantity must be greater than 0")   ,
    unit: z.string().min(1, "Unit is required").max(50, "Unit must be less than 50 characters"),
    calories: z.number().nonnegative("Calories cannot be negative").optional(),
    protein: z.number().nonnegative("Protein cannot be negative").optional(),
    fat: z.number().nonnegative("Fat cannot be negative").optional(),
    carbs: z.number().nonnegative("Carbs cannot be negative").optional(),
    fiber: z.number().nonnegative("Fiber cannot be negative").optional(),
    sugar: z.number().nonnegative("Sugar cannot be negative").optional(),
    notes: z.string().min(1, "String is required").max(50, "String must be less than 50 characters").optional(),
});

export const updateDietPlanMealSchema = z.object({
    meal_type: z.string().min(1, "Meal type is required").max(50, "Meal type must be less than 50 characters").optional(),
    meal_time: z.string().min(1, "Meal time is required").max(50, "Meal time must be less than 50 characters").optional(),
    quantity: z.number().positive("Quantity must be greater than 0").optional(),
    food_name: z.string().min(1, "Food name is required").max(50, "Food name must be less than 50 characters").optional(),
    calories: z.number().nonnegative("Calories cannot be negative").optional(),
    protein: z.number().nonnegative("Protein cannot be negative").optional(),
    fat: z.number().nonnegative("Fat cannot be negative").optional(),
    carbs: z.number().nonnegative("Carbs cannot be negative").optional(),
    fiber: z.number().nonnegative("Fiber cannot be negative").optional(),
    sugar: z.number().nonnegative("Sugar cannot be negative").optional(),
    unit: z.string().min(1, "Unit is required").max(50, "Unit must be less than 50 characters").optional(),
    notes: z.string().min(1, "String is required").max(50, "String must be less than 50 characters").optional(),

})
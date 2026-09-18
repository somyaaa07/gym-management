import { createDietPlanMealSchema, updateDietPlanMealSchema } from "./dietPlanMeal.validation.js";
import { DietPlan, DietPlanMeal } from "../../../model/index.js";


export const createDietPlanMeal = async (req, res) => {
    try {
        const result = createDietPlanMealSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: result.error.issues

            })
        }

        const {
            diet_plan_id,
            meal_type,
            meal_time,
            food_name,
            quantity,
            unit,
            calories,
            protein,
            fat,
            carbs,
            fiber,
            sugar,
            notes
        } = result.data;

        const tenant_id = req.user.tenant_id;

        const activeDietPlan = await DietPlan.findOne({
            where: {
                id: diet_plan_id,
                tenant_id,
                status: 'ACTIVE'
            }
        })

        if (!activeDietPlan) {
            return res.status(404).json({
                success: false,
                message: "No active diet plan found"
            })
        }

        const dietPlanMeal = await DietPlanMeal.create({
            diet_plan_id,
            meal_type,
            meal_time,
            food_name,
            quantity,
            unit,
            calories,
            protein,
            fat,
            carbs,
            fiber,
            sugar,
            notes,
            // tenant_id
        })

        return res.status(201).json({
            success: true,
            message: "Diet plan meal created successfully",
            data: dietPlanMeal
        })

    }
    catch (error) {
        console.log("Error in create dietPlanMeal", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",

        })
    }
}

export const updatedDietPlanMeal = async (req, res) => {
    try {
        const result = updateDietPlanMealSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                data: result.error.issues
            })
        }

        const dietPlanMealId = req.params.id;

        const tenant_id = req.user.tenant_id;
        const dietPlanId = req.params.dietPlanId;

        const dietPlan = await DietPlan.findOne({
            where: {
                id: dietPlanId,
                tenant_id: tenant_id,
                status: 'ACTIVE'
            }

        })

        if (!dietPlan) {
            return res.status(404).json({
                success: false,
                message: "Diet plan not found",
            })
        }


        const activeDietPlanMeal = await DietPlanMeal.findOne({
            where: {
                id: dietPlanMealId,
                diet_plan_id: dietPlanId
            }
        })

        if (!activeDietPlanMeal) {
            return res.status(404).json({
                success: false,
                message: "Diet plan meal not found"
            })


        }
        const updateDietPlanMeal = await activeDietPlanMeal.update(result.data);
        return res.status(200).json({
            success: true,
            message: "Diet plan meal updated successfully",
            data: updateDietPlanMeal
        })

    }
    catch (err) {
        console.log("Error in updating diet plan meal", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",

        })
    }
}

export const getAllDietPlanMeals = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const dietPlanMeals = await DietPlanMeal.findAll({
            include: [
                {
                    model: DietPlan,
                    where: {
                        tenant_id
                    }
                }
            ]

        })

        if (dietPlanMeals.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Diet plan meals not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Diet plan meals fetched successfully",
            data: dietPlanMeals
        })
    }
    catch (err) {
        console.log("Error in fetching diet plan meals", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}


export const getDietPlanMealById = async (req, res) => {
    try {
        const dietPlanMealId = req.params.id;

        const tenant_id = req.user.tenant_id;
        const dietPlanMeal = await DietPlanMeal.findOne({
            where:{
                id: dietPlanMealId,
            },
            include:[{
                model: DietPlan,
                where:{
                    tenant_id:tenant_id
                }
            }]
        });
        if (!dietPlanMeal) {
            return res.status(404).json({
                success: false,
                message: "Diet plan meal not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Diet plan meal fetched successfully",
            data: dietPlanMeal
        })
    }
    catch (err) {
        console.log("Error in fetching diet plan meal", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const deleteDietPlanMeal = async (req, res) => {
    try {
        const dietPlanMealId = req.params.id;
        const tenant_id = req.user.tenant_id;

        const dietPlanMeal = await DietPlanMeal.findOne({
            where:{
                id:dietPlanMealId
            },
            include:[{
                model:DietPlan,
                where:{
                    tenant_id:tenant_id
                }
            }]
        });
        if (!dietPlanMeal) {
            return res.status(404).json({
                success: false,
                message: "Diet plan meal not found"
            })
        }
        await dietPlanMeal.destroy();
        return res.status(200).json({
            success: true,
            message: "Diet plan meal deleted successfully",
        })
    }
    catch (err) {
        console.log("Error in deleting diet plan meal", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}
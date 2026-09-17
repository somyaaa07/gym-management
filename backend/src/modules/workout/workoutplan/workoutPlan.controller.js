import { WorkoutPlan, Member } from "../../../model/index.js";
import { createWorkoutSchema, updateWorkoutSchema } from "./workoutPlan.validation.js";


export const createWorkout = async (req, res) => {
    try {
        const result = createWorkoutSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const { member_id, name, description, goal, start_date, end_date } = result.data;

        const member = await Member.findOne({
            where: {
                id: member_id,
                tenant_id
            }
        })

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            })
        }

        const branch_id = member.branch_id;

        const workoutPlan = await WorkoutPlan.create({
            member_id,
            name,
            description,
            goal,
            start_date,
            end_date,
            branch_id,
            tenant_id
        })

        return res.status(201).json({
            success: true,
            message: "Workout plan created successfully",
            data: workoutPlan
        })
    }
    catch (err) {
        console.log("Error creating workout plan", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

export const getAllWorkoutPlans = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const workoutPlans = await WorkoutPlan.findAll({
            where: {
                tenant_id
            }
        })

        if (workoutPlans.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No workout plans found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Workout plans retrieved successfully",
            data: workoutPlans
        })

    }
    catch (err) {
        console.log("Error retrieving workout plans", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getWorkoutPlanById = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const workoutPlanId = req.params.id;

        const workoutPlan = await WorkoutPlan.findOne({
            where: {
                id: workoutPlanId,
                tenant_id
            }
        })

        if (!workoutPlan) {
            return res.status(404).json({
                success: false,
                message: "Workout plan not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Workout plan retrieved successfully",
            data: workoutPlan
        })
    }
    catch (err) {
        console.log("Error retrieving workout plan", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// export const updateWorkoutPlan = async(req,res)=>{

// }

export const updateWorkoutPlan = async (req, res) => {
    try {

        const result = updateWorkoutSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: result.error.issues
            })
        }
        const tenant_id = req.user.tenant_id;
        const id = req.params.id;

        const existingWorkoutPlan = await WorkoutPlan.findOne({
            where: {
                id, tenant_id
            }
        })

        if (!existingWorkoutPlan) {
            return res.status(404).json({
                success: false,
                message: "Workout plan not found"
            })
        }

        const {
            name,
            description,
            goal,
            start_date,
            end_date,
            status
        } = result.data;


        const newStartDate = start_date ?? existingWorkoutPlan.start_date;
        const newEndDate = end_date ?? existingWorkoutPlan.end_date;

        if (newStartDate > newEndDate) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be greater than end date"
            });
        }

        await existingWorkoutPlan.update({
            name,
            description,
            goal,
            start_date: newStartDate,
            end_date: newEndDate,
            status
        });

        return res.status(200).json({
            success: true,
            message: "Workout plan updated successfully",
            data: existingWorkoutPlan
        });


    }
    catch (err) {
        console.log("Error updating workout plan", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const deleteWorkoutPlan = async (req, res) => {
    try {
        const id = req.params.id;
        const tenant_id = req.user.tenant_id;

        const existingWorkoutPlan = await WorkoutPlan.findOne({
            where: {
                id, tenant_id
            }
        })

        if (!existingWorkoutPlan) {
            return res.status(404).json({
                success: false,
                message: "Workout plan not found"
            })
        }

        await existingWorkoutPlan.destroy();

        return res.status(200).json({
            success: true,
            message: "Workout plan deleted successfully"
        })
    }
    catch (err) {
        console.log("Error deleting workout plan", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }

}
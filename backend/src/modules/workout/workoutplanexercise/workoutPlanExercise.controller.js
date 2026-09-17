import { Exercise, WorkoutPlanExercise, WorkoutPlan } from '../../../model/index.js'
import { createWorkoutPlanExerciseSchema, updateWorkoutPlanExerciseSchema } from './workoutPlanExercise.validation.js';

export const createWorkoutPlanExercise = async (req, res) => {
    try {
        const result = createWorkoutPlanExerciseSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                error: result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const {
            workout_plan_id,
            exercise_id,
            day,
            sets,
            reps,
            duration,
            rest_seconds,
            notes
        } = result.data;

        const existingWorkoutPlan = await WorkoutPlan.findOne({
            where: {
                id: workout_plan_id,
                   tenant_id
            }
        })

        if (!existingWorkoutPlan) {
            return res.status(404).json({
                success: false,
                message: "Workout Plan not found"
            })
        }

        const existingExercise = await Exercise.findOne({
            where: {
                id: exercise_id,
                tenant_id: tenant_id
            }
        })

        if (!existingExercise) {
            return res.status(404).json({
                success: false,
                message: "Exercise not found"
            })
        }

        const workoutPlanExercise = await WorkoutPlanExercise.create({
            workout_plan_id,
            exercise_id,
            day,
            sets,
            reps,
            duration,
            rest_seconds,
            notes
        })

        return res.status(201).json({
            success: true,
            message: "Workout Plan Exercise created successfully",
            data: workoutPlanExercise
        })
    }
    catch (err) {
        console.log("Error while creating Workout Plan Exercise", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getWorkOutPlanExerciseById = async (req, res) => {
    try {
        const id = req.params.id
        const tenant_id = req.user.tenant_id;
        const workoutPlanExercise = await WorkoutPlanExercise.findOne({
            where: {
                id,

            }, include: [{
                model: WorkoutPlan,
                where: {
                    tenant_id
                },
                attributes: []
            }]
        })

        if (!workoutPlanExercise) {
            return res.status(404).json({
                success: false,
                message: "Workout Plan Exercise not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Particular Workout Plan Exercise fetched successfully",
            data: workoutPlanExercise
        })
    }
    catch (err) {
        console.log("Error while fetching Workout Plan Exercise", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const getAllWorkoutPlanExercise = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const workoutPlanExercise = await WorkoutPlanExercise.findAll({
            include: [{
                model: WorkoutPlan,
                where: {
                    tenant_id
                },
                attributes: []
            }]
        })
        if (workoutPlanExercise.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No Workout Plan Exercise found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "All Workout Plan Exercise fetched successfully",
            data: workoutPlanExercise
        })
    }
    catch (err) {
        console.log("Error while fetching Workout Plan Exercise", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const updateWorkoutPlanExercise = async (req, res) => {
    try {
        const result = updateWorkoutPlanExerciseSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: result.error.errors
            })
        }
        const tenant_id = req.user.tenant_id;

        const id = req.params.id;


        const existsWorkoutPlanExercise = await WorkoutPlanExercise.findOne({
            where: {
                id,

            },
            include: [{
                model: WorkoutPlan,
                where: {
                    tenant_id
                },
                attributes: []
            }]
        })

        if (!existsWorkoutPlanExercise) {
            return res.status(404).json({
                success: false,
                message: "Workout Plan Exercise not found"
            })
        }

        await existsWorkoutPlanExercise.update({
            ...result.data
        })

        return res.status(200).json({
            success: true,
            message: "Workout Plan Exercise updated successfully",
            data: existsWorkoutPlanExercise
        })
    }

    catch (err) {
        console.log("Error updating Workout Plan Exercise", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const deleteWorkoutPlanExercise = async (req, res) => {
    try {
        const id = req.params.id;
        const tenant_id = req.user.tenant_id;

        const existsWorkoutPlanExercise = await WorkoutPlanExercise.findOne({
            where: {
                id,
            },
            include: [{
                model: WorkoutPlan,
                where: {
                    tenant_id
                },
                attributes: []
            }]

        })

        if (!existsWorkoutPlanExercise) {
            return res.status(404).json({
                success: false,
                message: "Workout Plan Exercise not found"
            })
        }

        await existsWorkoutPlanExercise.destroy()

        return res.status(200).json({
            success: true,
            message: "Workout Plan Exercise deleted successfully"
        })
    }

    catch (err) {
        console.log("Error deleting Workout Plan Exercise", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
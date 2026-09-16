import { createGoalSchema, updateGoalSchema } from "./goals.validation.js";
import { Member, Goal, Branch } from '../../model/index.js';

export const createGoal = async (req, res) => {
    try {
        const result = createGoalSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: "Validation Error",
                error: result.error.issues
            })
        }
        const tenant_id = req.user.tenant_id;
        const member_id = result.data.member_id;

        const member = await Member.findOne({
            where: {
                id: member_id,
                tenant_id: tenant_id,
                status: 'ACTIVE'
            }
        })
        if (!member) {
            return res.status(404).json({
                status: false,
                message: "Member not found",
            })
        }

        const branch_id = member.branch_id;

        const { goal_type, target_value, target_unit, start_value, target_date, notes } = result.data;

        const goal = await Goal.create({
            goal_type: goal_type,
            target_value: target_value,
            target_unit: target_unit,
            start_value: start_value,
            target_date: target_date,
            // status:status,
            notes: notes,
            member_id: member_id,
            branch_id: branch_id,
            tenant_id: tenant_id
        })

        return res.status(201).json({
            status: true,
            message: "Goal created successfully",
            data: goal
        })
    }
    catch (err) {
        console.log("Error in creatingGoal", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}

export const getAllGoals = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const goals = await Goal.findAll({
            where: {
                tenant_id: tenant_id
            }
        })

        if (goals.length===0) {
            return res.status(404).json({
                status: false,
                message: "No goals found"
            })
        }


        return res.status(200).json({
            status: true,
            message: "Goals fetched successfully",
            data: goals
        })
    }
    catch (err) {
        console.log("Error in getAllGoals", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getBranchGoals = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.branch_id;

        const branch = await Branch.findOne({
            where: {
                tenant_id: tenant_id,
                id: branch_id
            }
        })

        if (!branch) {
            return res.status(404).json({
                status: false,
                message: "Branch not found"
            })
        }

        const goals = await Goal.findAll({
            where: {
                tenant_id: tenant_id,
                branch_id: branch_id
            }
        })

        if (goals.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No goals found"
            })
        }

        return res.status(200).json({
            status: true,
            message: "Goals fetched successfully",
            data: goals
        })
    }
    catch (err) {
        console.log("Error in getBranchGoals", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getGoalsById = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const goal_id = req.params.id;

        const goal = await Goal.findOne({
            where: {
                tenant_id: tenant_id,
                id: goal_id
            }
        })

        if (!goal) {
            return res.status(404).json({
                status: false,
                message: "No goal found"
            })
        }
        return res.status(200).json({
            status: true,
            message: "Goal fetched successfully",
            data: goal
        })
    }
    catch (err) {
        console.log("Error in getGoalsById", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const updateGoals = async (req, res) => {
    try{
        const result = updateGoalSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                status: false,
                message: "Validation Error",
                errors:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const goal_id = req.params.id;

        const {goal_type , target_value , target_unit , start_value , target_date , status} = result.data;

        const goal = await Goal.findOne({
            where:{
            id: goal_id,
            tenant_id: tenant_id,
            status:'ACTIVE'
            }
        })

        if (!goal) {
            return res.status(404).json 
            ({
                success: false,
                message: "Goal not found"
            })
        }

        await goal.update({
            goal_type,
            target_value,
            target_unit,
            start_value,
            target_date,
            status
        })

        return res.status(200).json({
            success: true,
            message: "Goal updated successfully"   , 
            data: goal
        })

    }

    catch(err){
        console.log("Error in updating goal",err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const deleteGoal = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const goal_id = req.params.id;

        const goal = await Goal.findOne({
            where:{
            id:goal_id,
            tenant_id:tenant_id,
            status:'ACTIVE'
            }
        })

        if (!goal) {
            return res.status(404).json 
            ({
                success: false,
                message: "Goal not found"
            })
        }

        // if(goal.status === 'COMPLETED'){
        //     return res.status(400).json 
        //     ({
        //         success: false,
        //         message: "Goal already completed"
        //     })

        // }

        await goal.update({
            status:'CANCELLED'
        })

        return res.status(200).json({
            success: true,
            message: "Goal cancelled successfully"   , 
        })
    }
    catch(err){
        console.log("Error in deleting goal",err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
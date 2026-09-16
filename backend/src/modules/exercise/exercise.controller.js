import {Exercise } from '../../model/index.js';
import { createExerciseSchema,updateExerciseSchema } from './exercise.validation.js';

export const createExercise = async(req,res)=>{
    try{
        const result = createExerciseSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                error:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const {name,description,equipment,category,muscle_group,difficulty,instructions,video_url} = result.data;
        const exercise = await Exercise.create({
            name,
            description,
            equipment,
            category,
            muscle_group,
            difficulty,
            instructions,
            video_url,
            tenant_id
        })
        return res.status(201).json({
            success:true,
            message:"Exercise created successfully",
            data:exercise
        })
    }
    catch(err){
        console.log("Error creating exercise",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const getAllExercise = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const exercises = await Exercise.findAll({
            where:{
                tenant_id
            }
        })
        if(exercises.length === 0){
            return res.status(404).json({
                success:false,
                message:"No exercises found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Exercises fetched successfully",
            data:exercises
        })
    }
    catch(err){
        console.log("Error fetching exercises",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getExerciseById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const exercise_id = req.params.id;

        const exercise = await Exercise.findOne({
            where:{
                id:exercise_id,
                tenant_id
            }
        })
        if(!exercise){
            return res.status(404).json({
                success:false,
                message:"Exercise not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Exercise fetched successfully",
            data:exercise
        })
    }
    catch(err){
        console.log("Error in fetching that particular exercise",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const updateExercise = async(req,res)=>{
    try{
        const result = updateExerciseSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"validation error",
                error:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;

        const exercise = await Exercise.findOne({
            where:{
                id:req.params.id,
                tenant_id
            }
        })

        if(!exercise){
            return res.status(404).json({
                success:false,
                message:"Exercise not found"
            })
            }
        
        await exercise.update({
          ...result.data
        })

        return res.status(200).json({
            success:true,
            message:"Exercise updated successfully",
            data:exercise
        })
    }
    catch(err){
        console.log("Error in updating exercise",err)
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

export const deleteExercise = async(req,res)=>{
    try{
        const {id} = req.params;
        const tenant_id = req.user.tenant_id;

        const exercise = await Exercise.findOne({
            where:{
                id,
                tenant_id
            }
        })
        if(!exercise){
            return res.status(404).json({
                success:false,
                message:"Exercise not found"
            })
        }

        await exercise.destroy();

        return res.status(200).json({
            success:true,
            message:"Exercise deleted successfully"
        })
        }
        catch(err){
            console.log("Error in deleting exercise",err)
            return res.status(500).json({
                success:false,
                message:"Internal Server Error"
            })
        }

}
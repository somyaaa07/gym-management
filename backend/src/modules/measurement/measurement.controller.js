// import { success } from 'zod';
import {Measurement,Member,Branch} from '../../model/index.js';
import { createMeasurementSchema, updateMeasurementSchema } from './measurement.validation.js';

export const createMeasurement = async(req,res)=>{
    try{
        const result = createMeasurementSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                error:result.error.issues
            })
        }

        const {member_id,weight,height,measured_at,body_fat,muscle_mass,waist,chest,arms,thighs,neck,systolic_bp,diastolic_bp} = result.data;
        const tenant_id = req.user.tenant_id

        const member = await Member.findOne({
            where:{
                id:member_id,
                tenant_id:tenant_id,
                status:'ACTIVE'
            }
        })

        if(!member){
            return res.status(400).json({
                success:false,
                message:"Member not found"
            })
        }

        const heightInMeter = height/100;
        const bmi = weight/(heightInMeter*heightInMeter);

        const measurement = await Measurement.create({
            tenant_id:tenant_id,
            branch_id :member.branch_id,
            member_id:member_id,
            weight:weight,
            height:height,
            bmi:bmi,
            measured_at:measured_at,
            body_fat:body_fat,
            muscle_mass:muscle_mass,
            waist:waist,
            chest:chest,
            arms:arms,
            thighs:thighs,
            neck:neck,
            systolic_bp:systolic_bp,
            diastolic_bp:diastolic_bp,

        })

        return res.status(201).json({
            success:true,
            message:"Measurement added successfully",
            data:measurement
        })
    }
    catch(error){
        console.log("Error in creatingMeasurement",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}

export const getAllMeasurements = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const measurements = await Measurement.findAll({
            where:{
                tenant_id :tenant_id
            }
        })

        if(measurements.length===0){
            return res.status(404).json({
                success:false,
                message:"No measurements found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Measurements fetched successfully",
            data:measurements
        })
    }
    catch(err){
        console.log("Error in getting all measurements",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getMeasurementByBranch = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const branch_id = req.params.branch_id;

        const branch = await Branch.findOne({
            where:{
                id:branch_id,
                tenant_id:tenant_id
            }
        })

        if(!branch){
            return res.status(404).json({
                success:false,
                message:"Branch not found"
            })
        }

        const measurements = await Measurement.findAll({
            where:{
                branch_id:branch_id,
                tenant_id:tenant_id
            }
        })

        if(measurements.length ===0){
            return res.status(404).json({
                success:false,
                message:"No measurements found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Measurements fetched successfully",
            data:measurements
        })
    }
    catch(err){
        console.log("Error in getMeasurementByBranch",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getMeasurementById = async(req,res)=>{
    try{
        const measurement_id = req.params.id;
        const tenant_id = req.user.tenant_id;

        const measurement = await Measurement.findOne({
            where:{
                id:measurement_id,
                tenant_id:tenant_id
            }
        })

        if(!measurement){
            return res.status(404).json({
                success:false,
                message:"No measurement found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Measurement fetched successfully",
            data:measurement
        })
    }
    catch(err){
        console.log("Error in getMeasurementById",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}

export const deleteMeasurementById = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const measurement_id = req.params.id;

        const measurement = await Measurement.findOne({
            where:{
                id:measurement_id,
                tenant_id:tenant_id
            }
        })

        if(!measurement){
            return res.status(404).json({
                success:false,
                message:"No measurement found"
            })
        }

        await measurement.destroy();

        return res.status(200).json({
            success:true,
            message:"Measurement deleted successfully"
        })

    }
    catch(error){
        console.log("Error in deleteMeasurementById",error)
        return res.status(500).json({

        })
    }
}

export const updateMeasurementById = async(req,res)=>{
    try{
        const result = updateMeasurementSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Invalid request",
                errors:result.error.issues
            })
        }


        const tenant_id = req.user.tenant_id;
        const id = req.params.id;

        const measurement = await Measurement.findOne({
            where:{
                id:id,
                tenant_id:tenant_id
            }
        })

        if(!measurement){
            return res.status(404).json({
                success:false,
                message:"No measurement found"
            })
        }
        const updateData = {...result.data}

        const newHeight = result.data.height ?? measurement.height;
        const newWeight = result.data.weight ?? measurement.weight;

        const heightInMeter = newHeight / 100;
        const bmi = newWeight / (heightInMeter * heightInMeter);

        updateData.bmi = bmi;
        await measurement.update(updateData);
        

        return res.status(200).json({
            success:true,
            message:"Measurement updated successfully",
            data:measurement
        })

    }
    catch(err){
        console.log("Error in updateMeasurementById",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error",
           
        })
    }
}
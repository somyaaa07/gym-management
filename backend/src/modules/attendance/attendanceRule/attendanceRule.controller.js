import { AttendanceRule } from "../../../model/index.js";
import { updateAttendanceRuleSchema } from "./attendanceRule.validation.js";
export const getAttendanceRule = async(req,res)=>{
    try{
    const tenant_id = req.user.tenant_id;
    let attendanceRule = await AttendanceRule.findOne({
        where:{
            tenant_id:tenant_id
        }
        
    })

    if(!attendanceRule){
        attendanceRule = await AttendanceRule.create({
            tenant_id:tenant_id
        })

    }

    return res.status(200).json({
        success:true,
        message:"Attendance Rule fetched successfully",
        data:attendanceRule
    })
}
catch(err){
    console.log("Error in getting attendance rule",err)
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}
}

export const updateAttendanceRule = async(req,res)=>{
    try{
        const result = updateAttendanceRuleSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                data:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const {grace_period_minutes,early_leave_threshold_minutes} = result.data;

        let attendanceRule = await AttendanceRule.findOne({
            where:{
                tenant_id:tenant_id
            }
        })

        if(!attendanceRule){
            attendanceRule = await AttendanceRule.create({
                tenant_id:tenant_id,
            })
        }

        await attendanceRule.update({
            ...(grace_period_minutes !== undefined && {grace_period_minutes}),
            ...(early_leave_threshold_minutes !== undefined && {early_leave_threshold_minutes})
        })

        return res.status(200).json({
            success:true,
            message:"Attendance Rule Updated Successfully",
            data:attendanceRule
        })
    }
    catch(err){
        console.log("Error in updateAttendanceRule",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            
        })
    }
}
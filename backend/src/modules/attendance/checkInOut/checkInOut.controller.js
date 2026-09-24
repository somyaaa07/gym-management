import {Member , MemberFaceId ,MemberSlots , AttendanceRule,Attendance} from '../../../model/index.js';
import { checkInSchema, checkOutSchema } from './checkInOut.validation.js';
import { getFaceEncoding } from '../../../services/faceEncoding.services.js';
import { findMatchingFace } from '../../../services/faceMatching.services.js';
import { Op } from 'sequelize';

export const checkIn = async(req,res)=>{
    try{
        const result = checkInSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({message:"Validation Error",error:result.error.issues});
        }

        const tenant_id = req.user.tenant_id;
        const { method, image, member_id: manualMemberId, branch_id } = result.data;

        let member_id;

        if(method === 'FACE'){
             const face_embedding = await getFaceEncoding(image);

            const registeredFaces = await MemberFaceId.findAll({
                where: { tenant_id, is_active: true },
                include: [{ model: Member, attributes: ["id", "name"] }]
            });

            const { matchedFace, isMatch } = findMatchingFace(face_embedding, registeredFaces);

            if (!isMatch) {
                return res.status(404).json({
                    success: false,
                    message: "Face not recognized"
                });
            }

            member_id = matchedFace.member_id;
        } else {
            member_id = manualMemberId;
        }


        const member = await Member.findOne({
            where:{
                id:member_id,
                tenant_id:tenant_id
            }
        })

        if(!member){
            return res.status(404).json({
                success: false,
                message: "Member not found"
            })
        }

        const attendance = await Attendance.findOne({
            where:{
                member_id:member_id,
                tenant_id:tenant_id,
                check_out_time:null

            }
        })

        if(attendance){
            return res.status(409).json({
                success:false,
                message:"Member already checked in please check out first you idiot."
            })
        }

        const memberSlot = await MemberSlots.findOne({
            where: {
                member_id: member_id,
                tenant_id: tenant_id
            }
        })

        if (!memberSlot) {
            return res.status(404).json({
                success: false,
                message: "Member slot not found"
            })
        }

        let attendanceRule = await AttendanceRule.findOne({
            where: { tenant_id }
        });

        if (!attendanceRule) {
            attendanceRule = await AttendanceRule.create({ tenant_id });
        }

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [slotHour, slotMinute] = memberSlot.slot_start_time.split(':').map(Number);
        const slotStartMinutes = slotHour * 60 + slotMinute;

        const deadlineMinutes = slotStartMinutes + attendanceRule.grace_period_minutes;

        const check_in_status = currentMinutes <= deadlineMinutes ? 'ON_TIME' : 'LATE';

       const newAttendance = await Attendance.create({
            tenant_id,
            branch_id,
            member_id,
            check_in_time: new Date(),
            check_in_method:method,
            check_in_status,
            verified_by:method === 'MANUAL' ? req.user.id : null,
       })
        
       return res.status(200).json({
            success:true,
            message:"Check in successful",
            data:newAttendance
       })

    }
    catch(err){
        console.log("Error in check in",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const checkOut = async(req,res)=>{
    try{
        const result = checkOutSchema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                success:false,
                message:"Validation Error",
                error:result.error.issues
            })
        }

        const tenant_id = req.user.tenant_id;
        const {method , image , member_id:manualMemberId} = result.data;

        let member_id;

        if(method === 'FACE'){
            const face_embedding = await getFaceEncoding(image);

            const registeredFaces = await MemberFaceId.findAll({
                where:{
                    tenant_id,
                    is_active:true
                },
                include:[{
                    model:Member,
                    attributes:["id","name"]
                }]
            })

            const {matchedFace, isMatch} = findMatchingFace(face_embedding,registeredFaces)

            if(!isMatch){
                return res.status(400).json({
                    success:false,
                    message:"Face not Matched",
                })

            }

            member_id = matchedFace.member_id;

        }
        else{
            member_id = manualMemberId;
        }

        const attendance = await Attendance.findOne({
            where:{
                member_id,
                tenant_id,
                check_out_time:null
            }
        })

        if(!attendance){
            return res.status(400).json({
                success:false,
                message:"no checked In member found"
            })
        }

        const memberSlot = await MemberSlots.findOne({
            where:{
                tenant_id,
                member_id,

            }
        })

        if(!memberSlot){
            return res.status(400).json({
                success:false,
                message:"no slot found for this member"
            })
        }

        let attendanceRule = await AttendanceRule.findOne({
            where:{
                tenant_id,
            }
        })

        if(!attendanceRule){
           attendanceRule = await AttendanceRule.create({tenant_id})
        }

        const now = new Date();

        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [slotHour, slotMinute] = memberSlot.slot_end_time.split(':').map(Number);
        const slotEndMinutes = slotHour * 60 + slotMinute;

        const earlyDeadlineMinutes = slotEndMinutes - attendanceRule.early_leave_threshold_minutes;

        const check_out_status = currentMinutes < earlyDeadlineMinutes ?   "EARLY_LEAVE":"ON_TIME";

        await attendance.update({
            check_out_time:new Date(),
            check_out_method:method,
            check_out_status:check_out_status
        })

        return res.status(200).json({
            success:true,
            message:"check out successfully",
            data:attendance
        })
    }
    catch(err){
        console.log("Error in checkOut",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getAttendanceHistory = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {member_id,from_date,to_date} = req.query;


        const whereClause = {
            tenant_id,
            ...(member_id && {member_id}),
            ...(from_date && to_date &&{
                check_in_time:{
                    [Op.between]:[new Date(from_date),new Date(to_date)]
                }
            })

        }

        const attendance = await Attendance.findAll({
            where: whereClause,
                include:[{
                    model:Member,
                    attributes:["id","name"],
                }],
                order:[['check_in_time',"DESC"]]
        })

        return res.status(200).json({
            success:true,
            message:`Attendance History Successfully fetched for this ${member_id}`,
            data:attendance
        })

    }
    catch(err){
        console.log("Error in fetching attendance history",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}




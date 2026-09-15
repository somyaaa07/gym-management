import {Member , MemberFaceId ,MemberSlots , AttendanceRule,Attendance} from '../../../model/index.js';
import { checkInSchema } from './checkInOut.validation.js';
import { getFaceEncoding } from '../../../services/faceEncoding.services.js';
import { findMatchingFace } from '../../../services/faceMatching.services.js';

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
                return res.status(401).json({
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

       
        

    }
    catch(err){
        console.log("Error in check in",err)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}
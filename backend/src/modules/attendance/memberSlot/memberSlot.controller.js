import { createMemberSlotSchema, updateMemberSlotSchema } from "./memberSlot.validation.js";
import { Member, MemberSlots } from "../../../model/index.js";

export const createMemberSlot = async (req, res) => {
    try {
        const result = createMemberSlotSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                error: result.error.issues
            })
        }
        const tenant_id = req.user.tenant_id;
        const { member_id, slot_start_time, slot_end_time } = result.data;

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
        const existingSlot = await MemberSlots.findOne({
            where: { member_id, tenant_id }
        });

        if (existingSlot) {
            await existingSlot.update({ slot_start_time, slot_end_time });
            return res.status(200).json({
                success: true,
                message: "Member slot updated successfully",
                data: existingSlot
            });
        }
        const memberSlot = await MemberSlots.create({
            member_id,
            slot_start_time,
            slot_end_time,
            tenant_id
        })
        return res.status(201).json({
            success: true,
            message: "Member slot created successfully",
            data: memberSlot
        })

    }
    catch (err) {
        console.log("Error in createMemberSlot", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

export const getMemberSlots = async (req, res) => {
    try {

        const tenant_id = req.user.tenant_id;
        const member_id = req.params.member_id;

        const memberSlots = await MemberSlots.findAll({
            where: { member_id, tenant_id },
            include: [{
                model: Member,
                attributes: ["id", 'name']
            },]
        })

        if(memberSlots.length === 0){
            return res.status(404).json({
                success: false,
                message: "No member slots found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Member slots fetched successfully",
            data: memberSlots
        })

    }
    catch (err) {
        console.log("Error in getMemberSlots", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}

export const updateMemberSlot = async(req,res)=>{
    try{

        const result = updateMemberSlotSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid request",
                data: result.error.issues
            })
        }
        const tenant_id = req.user.tenant_id;
        const member_id = req.params.member_id;

        const {slot_end_time,slot_start_time} = result.data;

        const member = await MemberSlots.findOne({
            where:{
                tenant_id:tenant_id,
                member_id:member_id
            }
        })

        if(!member){
            return res.status(404).json
            ({
                success: false,
                message: "Member not found"
            })
        }

       await member.update({
            ...(slot_end_time !== undefined && {slot_end_time}),
            ...(slot_start_time !== undefined && {slot_start_time})
        })


        return res.status(200).json({
            success: true,
            message: "Member slot updated successfully",
            data: member
        })

    }
    catch(err){
        console.log("Error in updateMemberSlot",err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
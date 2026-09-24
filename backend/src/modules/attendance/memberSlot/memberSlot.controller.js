import {
  createMemberSlotSchema,
  updateMemberSlotSchema,
} from "./memberSlot.validation.js";

import { Member, MemberSlots } from "../../../model/index.js";

// =====================================================
// CREATE / UPDATE MEMBER SLOT
// =====================================================

export const createMemberSlot = async (req, res) => {
  try {
    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    const result = createMemberSlotSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: result.error.issues,
      });
    }

    // ---------------------------------------------
    // TENANT
    // ---------------------------------------------

    const tenant_id = req.user.tenant_id;

    const { member_id, slot_start_time, slot_end_time } = result.data;

    // ---------------------------------------------
    // FIND MEMBER
    // ---------------------------------------------

    const member = await Member.findOne({
      where: {
        id: member_id,
        tenant_id,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // ---------------------------------------------
    // MEMBER'S REGISTERED BRANCH
    // ---------------------------------------------

    const branch_id = member.branch_id;

    if (!branch_id) {
      return res.status(400).json({
        success: false,
        message: "Member is not assigned to any branch",
      });
    }

    // ---------------------------------------------
    // CHECK EXISTING SLOT
    // ---------------------------------------------

       // ---------------------------------------------
    // CURRENT (ACTIVE) SLOT
    // ---------------------------------------------

    const activeSlot = await MemberSlots.findOne({
      where: { member_id, tenant_id, is_active: true },
    });

    if (activeSlot) {
      const same =
        String(activeSlot.slot_start_time).slice(0, 5) === slot_start_time.slice(0, 5) &&
        String(activeSlot.slot_end_time).slice(0, 5) === slot_end_time.slice(0, 5);

      // time wahi hai to nayi row mat banao
      if (same) {
        return res.status(200).json({
          success: true,
          message: "Member slot unchanged",
          data: activeSlot,
        });
      }

      // purana slot history mein chala jaaye
      await activeSlot.update({ is_active: false });
    }

    // ---------------------------------------------
    // CREATE NEW SLOT
    // ---------------------------------------------

    const memberSlot = await MemberSlots.create({
      member_id,
      tenant_id,
      slot_start_time,
      slot_end_time,
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Member slot saved successfully",
      data: memberSlot,
    });
    // ---------------------------------------------
    // CREATE SLOT
    // ---------------------------------------------

  } catch (err) {
    console.log("Error in createMemberSlot:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// GET MEMBER SLOT
// =====================================================

export const getMemberSlots = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const member_id = req.params.member_id;

    // ---------------------------------------------
    // FIND MEMBER FIRST
    // ---------------------------------------------

    const member = await Member.findOne({
      where: {
        id: member_id,
        tenant_id,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const branch_id = member.branch_id;

    // ---------------------------------------------
    // GET SLOT
    // ---------------------------------------------

   const memberSlots = await MemberSlots.findAll({
  where: { member_id, tenant_id },
  order: [["is_active", "DESC"], ["created_at", "DESC"]],
  include: [{ model: Member, attributes: ["id", "name", "branch_id"] }],
});

    if (memberSlots.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No member slots found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member slots fetched successfully",
      data: memberSlots,
    });
  } catch (err) {
    console.log("Error in getMemberSlots:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// =====================================================
// UPDATE MEMBER SLOT
// =====================================================

export const updateMemberSlot = async (req, res) => {
  try {
    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    const result = updateMemberSlotSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        data: result.error.issues,
      });
    }

    const tenant_id = req.user.tenant_id;
    const member_id = req.params.member_id;

    const { slot_end_time, slot_start_time } = result.data;

    // ---------------------------------------------
    // FIND MEMBER
    // ---------------------------------------------

    const member = await Member.findOne({
      where: {
        id: member_id,
        tenant_id,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    // ---------------------------------------------
    // GET MEMBER BRANCH
    // ---------------------------------------------

    const branch_id = member.branch_id;

    // ---------------------------------------------
    // FIND MEMBER SLOT
    // ---------------------------------------------

    const memberSlot = await MemberSlots.findOne({
      where: {
        tenant_id,
        branch_id,
        member_id,
      },
    });

    if (!memberSlot) {
      return res.status(404).json({
        success: false,
        message: "Member slot not found",
      });
    }

    // ---------------------------------------------
    // UPDATE
    // ---------------------------------------------

    await memberSlot.update({
      ...(slot_end_time !== undefined && {
        slot_end_time,
      }),

      ...(slot_start_time !== undefined && {
        slot_start_time,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Member slot updated successfully",
      data: memberSlot,
    });
  } catch (err) {
    console.log("Error in updateMemberSlot:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

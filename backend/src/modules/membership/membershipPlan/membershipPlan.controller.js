import { Op } from "sequelize";
import { Tenant, Branch, MembershipPlan } from "../../../model/index.js";
import {
  membershipPlanSchema,
  membershipPlanUpdateSchema,
} from "./membershipPlan.validation.js";

// ======================================================
// CREATE MEMBERSHIP PLAN
// ======================================================

export const createMembershipPlan = async (req, res) => {
  try {
    const result = membershipPlanSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: result.error.issues,
      });
    }

    const {
      name,
      description,
      duration,
      duration_unit,
      price,
      discount,
      access_type,
      branch_id,
    } = result.data;

    const tenant_id = req.user.tenant_id;

    // -----------------------------------------
    // Check tenant
    // -----------------------------------------

    const tenant = await Tenant.findByPk(tenant_id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    // -----------------------------------------
    // SINGLE BRANCH
    // -----------------------------------------

    if (access_type === "SINGLE_BRANCH") {
      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: "Branch is required for SINGLE_BRANCH plan",
        });
      }

      // Make sure branch belongs to same tenant
      const branch = await Branch.findOne({
        where: {
          id: branch_id,
          tenant_id: tenant_id,
          status: 1,
        },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }
    }

    // -----------------------------------------
    // ALL BRANCHES
    // -----------------------------------------

    let finalBranchId = null;

    if (access_type === "SINGLE_BRANCH") {
      finalBranchId = branch_id;
    }

    // -----------------------------------------
    // Duplicate plan name
    // -----------------------------------------

    const existingPlan = await MembershipPlan.findOne({
      where: {
        tenant_id: tenant_id,
        name: name,
      },
    });

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: "Membership plan already exists",
      });
    }

    // -----------------------------------------
    // Create plan
    // -----------------------------------------

    const membershipPlan = await MembershipPlan.create({
      tenant_id,

      branch_id: finalBranchId,

      name,
      description,
      duration,
      duration_unit,
      price,
      discount,
      access_type,

      status: "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Membership plan created successfully",

      data: {
        id: membershipPlan.id,
        tenant_id: membershipPlan.tenant_id,
        branch_id: membershipPlan.branch_id,

        name: membershipPlan.name,
        description: membershipPlan.description,
        duration: membershipPlan.duration,
        duration_unit: membershipPlan.duration_unit,
        price: membershipPlan.price,
        discount: membershipPlan.discount,
        access_type: membershipPlan.access_type,
        status: membershipPlan.status,
      },
    });
  } catch (err) {
    console.log("failed to createMembershipPlan", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================================
// GET MEMBERSHIP PLANS
// ======================================================

export const getAllMembershipPlans = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const role = req.user.role;

    let where = {
      tenant_id: tenant_id,
      status: "ACTIVE",
    };

    // -----------------------------------------
    // ADMIN
    // -----------------------------------------
    // ADMIN sees all plans of his tenant

    if (role === "ADMIN") {
      // No branch filter
    }

    // -----------------------------------------
    // BRANCH ADMIN / MEMBER
    // -----------------------------------------
    else if (role === "BRANCH_ADMIN" || role === "MEMBER") {
      const branch_id = req.user.branch_id;

      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with any branch",
        });
      }

      where[Op.or] = [
        // Plans available for every branch
        {
          access_type: "ALL_BRANCHES",
        },

        // Plans specifically created for this branch
        {
          access_type: "SINGLE_BRANCH",
          branch_id: branch_id,
        },
      ];
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view membership plans",
      });
    }

    const membershipPlans = await MembershipPlan.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,

      message:
        membershipPlans.length === 0
          ? "No membership plans found"
          : "Membership plans fetched successfully",

      data: membershipPlans,
    });
  } catch (err) {
    console.log("failed to getAllMembershipPlans", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// GET MEMBERSHIP PLAN BY ID
// ======================================================

export const getMembershipPlanById = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const role = req.user.role;
    const membershipPlan_id = req.params.id;

    let where = {
      id: membershipPlan_id,
      tenant_id: tenant_id,
      status: "ACTIVE",
    };

    // -----------------------------------------
    // BRANCH ADMIN / MEMBER
    // -----------------------------------------

    if (role === "BRANCH_ADMIN" || role === "MEMBER") {
      const branch_id = req.user.branch_id;

      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: "User is not associated with any branch",
        });
      }

      where[Op.or] = [
        {
          access_type: "ALL_BRANCHES",
        },
        {
          access_type: "SINGLE_BRANCH",
          branch_id: branch_id,
        },
      ];
    }

    const membershipPlan = await MembershipPlan.findOne({
      where,
    });

    if (!membershipPlan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    return res.status(200).json({
      success: true,

      message: "Membership plan fetched successfully",

      data: {
        id: membershipPlan.id,
        tenant_id: membershipPlan.tenant_id,
        branch_id: membershipPlan.branch_id,

        name: membershipPlan.name,
        description: membershipPlan.description,
        price: membershipPlan.price,
        duration: membershipPlan.duration,
        status: membershipPlan.status,
        duration_unit: membershipPlan.duration_unit,
        discount: membershipPlan.discount,
        access_type: membershipPlan.access_type,
      },
    });
  } catch (err) {
    console.log("failed to getMembershipPlanById", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ======================================================
// DELETE MEMBERSHIP PLAN
// ======================================================

export const deleteMembershipPlan = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const membershipPlan_id = req.params.id;

    const membershipPlan = await MembershipPlan.findOne({
      where: {
        id: membershipPlan_id,
        tenant_id: tenant_id,
        status: "ACTIVE",
      },
    });

    if (!membershipPlan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    await membershipPlan.update({
      status: "INACTIVE",
    });

    return res.status(200).json({
      success: true,
      message: "Membership plan deleted successfully",
    });
  } catch (err) {
    console.log("failed to deleteMembershipPlan", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE MEMBERSHIP PLAN

export const updateMembershipPlan = async (req, res) => {
  try {
    const result = membershipPlanUpdateSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: result.error.issues,
      });
    }

    const tenant_id = req.user.tenant_id;
    const membershipPlan_id = req.params.id;

    const existingMembershipPlan = await MembershipPlan.findOne({
      where: {
        id: membershipPlan_id,
        tenant_id: tenant_id,
        status: "ACTIVE",
      },
    });

    if (!existingMembershipPlan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    // -----------------------------------------
    // Duplicate name check
    // -----------------------------------------

    if (result.data.name) {
      const existingPlan = await MembershipPlan.findOne({
        where: {
          tenant_id: tenant_id,
          name: result.data.name,
        },
      });

      if (existingPlan && existingPlan.id !== membershipPlan_id) {
        return res.status(409).json({
          success: false,
          message: "Membership plan with this name already exists",
        });
      }
    }

    // -----------------------------------------
    // Branch validation during update
    // -----------------------------------------

    if (result.data.access_type === "SINGLE_BRANCH") {
      if (!result.data.branch_id) {
        return res.status(400).json({
          success: false,
          message: "Branch is required for SINGLE_BRANCH plan",
        });
      }

      const branch = await Branch.findOne({
        where: {
          id: result.data.branch_id,
          tenant_id: tenant_id,
          status: 1,
        },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
        });
      }
    }

    // -----------------------------------------
    // ALL_BRANCHES

    const updateData = {
      ...result.data,
    };

    if (result.data.access_type === "ALL_BRANCHES") {
      updateData.branch_id = null;
    }

    await existingMembershipPlan.update(updateData);

    return res.status(200).json({
      success: true,

      message: "Membership plan updated successfully",

      data: {
        id: existingMembershipPlan.id,
        tenant_id: existingMembershipPlan.tenant_id,
        branch_id: existingMembershipPlan.branch_id,

        name: existingMembershipPlan.name,
        description: existingMembershipPlan.description,
        price: existingMembershipPlan.price,
        duration: existingMembershipPlan.duration,
        status: existingMembershipPlan.status,
        discount: existingMembershipPlan.discount,
        access_type: existingMembershipPlan.access_type,
        duration_unit: existingMembershipPlan.duration_unit,
      },
    });
  } catch (err) {
    console.log("failed to updateMembershipPlan", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

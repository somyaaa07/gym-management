import crypto from "crypto";
import { sequelize } from "../../../config/database.js";
import {
  Branch,
  Member,
  MemberMembership,
  MembershipPlan,
  User,
} from "../../../model/index.js";
import {
  memberValidationSchema,
  updateMemberValidationSchema,
  setPasswordValidationSchema,
} from "./memberValidation.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { sendSetPasswordEmail } from "../../../utils/mailer.js";
export const createMember = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const result = memberValidationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: result.error.issues,
      });
    }

    const {
      name,
      phone,
      email,
      date_of_birth,
      gender,
      profile_image,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      joining_date,
      branch_id: requested_branch_id,
    } = result.data;
    
    const tenant_id = req.user.tenant_id;

    let branch_id;

    if (req.user.role === "BRANCH_ADMIN") {
      // Branch Admin can only create members in their own branch
      branch_id = req.user.branch_id;
    } else {
      // Admin selects the branch
      branch_id = requested_branch_id;
    }

    if (!branch_id) {
      return res.status(400).json({
        success: false,
        message: "Branch is required",
      });
    }

    const branch = await Branch.findOne({
      where: {
        id: branch_id,
        tenant_id: tenant_id,
      },
      transaction: t,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found on the particular tenant",
      });
    }
    const existingUser = await User.findOne({
      where: { email },
      transaction: t,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user mail already exists",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create(
      {
        name,
        email,
        phone,
        tenant_id,
        branch_id,
        password: null,
        role: "MEMBER",
        reset_token: hashedToken,
        reset_token_expiry: tokenExpiry,
      },
      {
        transaction: t,
      },
    );

    const member = await Member.create(
      {
        name: name,
        phone: phone,
        email: email,
        date_of_birth: date_of_birth,
        gender: gender,
        profile_image: profile_image,
        address: address,
        emergency_contact_name: emergency_contact_name,
        emergency_contact_phone: emergency_contact_phone,
        joining_date: joining_date,
        branch_id: branch_id,
        tenant_id: tenant_id,
        user_id: user.id,
      },
      {
        transaction: t,
      },
    );

    await t.commit();
    try {
      await sendSetPasswordEmail(email, name, rawToken);
    } catch (mailErr) {
      console.log("Failed to send set-password email:", mailErr);
      // member phir bhi create ho chuka hai, mail fail hone se poora request fail nahi karenge
    }

    return res.status(201).json({
      success: true,
      message: "Member created successfully. Set-password link sent to email.",
      data: {
        name: member.name,
        phone: member.phone,
        email: member.email,
        date_of_birth: member.date_of_birth,
        gender: member.gender,
        profile_image: member.profile_image,
        address: member.address,
        emergency_contact_name: member.emergency_contact_name,
        emergency_contact_phone: member.emergency_contact_phone,
        joining_date: member.joining_date,
        branch_id: member.branch_id,
        tenant_id: member.tenant_id,
      },
    });
  } catch (err) {
    await t.rollback();
    console.log("failed in creating the member", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const setPassword = async (req, res) => {
  try {
    const result = setPasswordValidationSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation error",
          errors: result.error.issues,
        });
    }

    const { token, password } = result.data;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        reset_token: hashedToken,
        reset_token_expiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null,
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Password set successfully. You can now login.",
      });
  } catch (err) {
    console.log("failed in setting password", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllMember = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const member = await Member.findAll({
      where: {
        tenant_id: tenant_id,
        status: "ACTIVE",
      },
    });

    return res.status(200).json({
      success: true,
      message:
        member.length === 0
          ? "No members found"
          : "Members fetched successfully",
      data: member,
    });
  } catch (err) {
    console.log("failed in getting the members", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const member_id = req.params.id;
    const member = await Member.findOne({
      where: {
        tenant_id: tenant_id,
        // branch_id: branch_id,
        id: member_id,
        status: "ACTIVE",
      },
      include: [
        {
          model: MemberMembership,
          include: [
            {
              model: MembershipPlan,
            },
          ],
        },
      ],
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member fetched successfully",
      data: member,
    });
  } catch (err) {
    console.log("failed in getting the member by it's id", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBranchMembers = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const branch_id = req.params.id;

    const members = await Member.findAll({
      where: {
        tenant_id: tenant_id,
        branch_id: branch_id,
        status: "ACTIVE",
      },
    });

    if (members.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No members found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Members fetched successfully",
      data: members,
    });
  } catch (err) {
    console.log("failed in getting the members of a branch", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBranchMemberById = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const branch_id = req.params.branch_id;
    const member_id = req.params.member_id;

    const branch = await Branch.findOne({
      where: {
        tenant_id: tenant_id,
        id: branch_id,
      },
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    const member = await Member.findOne({
      where: {
        tenant_id: tenant_id,
        branch_id: branch_id,
        id: member_id,
        status: "ACTIVE",
      },
      include: [
        {
          model: MemberMembership,
          include: [
            {
              model: MembershipPlan,
            },
          ],
        },
      ],
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member found",
      data: member,
    });
  } catch (err) {
    console.log("Error in getMemberById", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member_id = req.params.id;
    const tenant_id = req.user.tenant_id;

    const member = await Member.findOne({
      where: {
        tenant_id: tenant_id,
        id: member_id,
        status: "ACTIVE",
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await member.update({
      status: "INACTIVE",
    });

    console.log("params:", req.params);
    console.log("member_id:", req.params.id);
    console.log("tenant_id:", req.user.tenant_id);
    return res.status(200).json({
      success: true,
      message: "Member deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleteMember", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateMember = async (req, res) => {
  try {
    const result = updateMemberValidationSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: result.error.issues,
      });
    }

    const tenant_id = req.user.tenant_id;
    const memeber_id = req.params.id;
    const {
      name,
      email,
      phone,
      gender,
      date_of_birth,
      joining_date,
      address,
      profile_image,
      emergency_contact_name,
      emergency_contact_phone,
      branch_id,
    } = result.data;

    const existingMember = await Member.findOne({
      where: {
        tenant_id: tenant_id,
        id: memeber_id,
        status: "ACTIVE",
      },
    });

    if (!existingMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    if (branch_id && branch_id != existingMember.branch_id) {
      const branch = await Branch.findOne({
        where: {
          tenant_id: tenant_id,
          id: branch_id,
          status: true,
        },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Particular branch not found",
        });
      }
    }

    await existingMember.update(result.data);

    return res.status(200).json({
      success: true,
      message: "Member updated successfully",
      data: {
        name: existingMember.name,
        email: existingMember.email,
        phone: existingMember.phone,
        gender: existingMember.gender,
        date_of_birth: existingMember.date_of_birth,
        joining_date: existingMember.joining_date,
        address: existingMember.address,
        profile_image: existingMember.profile_image,
        emergency_contact_name: existingMember.emergency_contact_name,
        emergency_contact_phone: existingMember.emergency_contact_phone,
        branch_id: existingMember.branch_id,
      },
    });
  } catch (err) {
    console.log("failed in updating the member", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update the member",
    });
  }
};

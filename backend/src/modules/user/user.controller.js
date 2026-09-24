import { userSchema, updateUserSchema } from "./user.validation.js";
import { Tenant, User, Branch } from "../../model/index.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    // ==========================================
    // VALIDATION
    // ==========================================

    const result = userSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: result.error.issues,
      });
    }

    const {
      name,
      email,
      phone,
      password,
      tenant_id: bodyTenantId,
      branch_id,
      role,
    } = result.data;

    // ==========================================
    // CREATOR DETAILS
    // ==========================================

    const creatorRole = req.user.role;

    let tenant_id = null;
    let finalBranchId = null;
    let finalRole = role;

    console.log("CREATE USER DEBUG:", {
      creatorRole,
      creatorUserId: req.user.id,
      creatorTenantId: req.user.tenant_id,
      creatorBranchId: req.user.branch_id,
      requestedTenantId: bodyTenantId,
      requestedBranchId: branch_id,
      finalBranchId,
      role,
    });

    // ==========================================
    // SUPER ADMIN → CREATE ADMIN
    // ==========================================

    if (creatorRole === "SUPER_ADMIN") {
      // SUPER_ADMIN must provide tenant_id
      if (!bodyTenantId) {
        return res.status(400).json({
          success: false,
          message: "Tenant is required for ADMIN user",
        });
      }

      // SUPER_ADMIN can only create ADMIN
      if (role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Super Admin can only create ADMIN users",
        });
      }

      // Check tenant
      const tenant = await Tenant.findByPk(bodyTenantId);

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: "Tenant not found",
        });
      }

      tenant_id = tenant.id;

      // ADMIN is tenant-level user
      finalBranchId = null;
      finalRole = "ADMIN";
    }

    // ==========================================
    // ADMIN → CREATE BRANCH USER
    // ==========================================
    else if (creatorRole === "ADMIN") {
      // ADMIN must have tenant
      if (!req.user.tenant_id) {
        return res.status(403).json({
          success: false,
          message: "Admin is not associated with any tenant",
        });
      }

      tenant_id = req.user.tenant_id;

      // ADMIN cannot create SUPER_ADMIN
      if (role === "SUPER_ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot create SUPER_ADMIN",
        });
      }

      // ADMIN cannot create another ADMIN
      if (role === "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot create another ADMIN",
        });
      }

      // Branch is required for branch-level users
      if (!branch_id) {
        return res.status(400).json({
          success: false,
          message: "Branch is required",
        });
      }

      // Verify branch belongs to ADMIN's tenant
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
          message: "Branch not found or does not belong to your tenant",
        });
      }

      finalBranchId = branch.id;
    }

    // ==========================================
    // BRANCH ADMIN → CREATE STAFF
    // ==========================================
    else if (creatorRole === "BRANCH_ADMIN") {
      tenant_id = req.user.tenant_id;

      // Branch Admin must belong to tenant
      if (!tenant_id) {
        return res.status(403).json({
          success: false,
          message: "Branch Admin is not associated with any tenant",
        });
      }

      // Branch Admin must belong to branch
      finalBranchId = req.user.branch_id;

      if (!finalBranchId) {
        return res.status(400).json({
          success: false,
          message: "Branch Admin is not assigned to any branch",
        });
      }

      // Branch Admin cannot create privileged roles
      if (
        role === "ADMIN" ||
        role === "SUPER_ADMIN" ||
        role === "BRANCH_ADMIN"
      ) {
        return res.status(403).json({
          success: false,
          message: "Branch Admin cannot create this role",
        });
      }

      // Verify Branch Admin's branch
      const branch = await Branch.findOne({
        where: {
          id: finalBranchId,
          tenant_id: tenant_id,
          status: 1,
        },
      });

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Your branch was not found",
        });
      }
    }

    // ==========================================
    // OTHER ROLES
    // ==========================================
    else {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create users",
      });
    }

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    const existingUser = await User.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // ==========================================
    // CHECK DUPLICATE PHONE
    // ==========================================

    if (phone) {
      const existingPhone = await User.findOne({
        where: {
          phone,
        },
      });

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "User with this phone already exists",
        });
      }
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const passwordHashed = await bcrypt.hash(password, 10);

    // ==========================================
    // CREATE USER
    // ==========================================

    const user = await User.create({
      name,
      email,
      phone,
      password: passwordHashed,
      tenant_id,
      branch_id: finalBranchId,
      role: finalRole,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        tenant_id: user.tenant_id,
        branch_id: user.branch_id,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.log("Failed to create user:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    // const branch_id = req.params.id;
    const users = await User.findAll({
      where: {
        tenant_id: tenant_id,
        status: "ACTIVE",

        // branch_id:branch_id
      },
      attributes: {
        exclude: ["password"],
      },
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (err) {
    console.log("failed to get users", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.params.id;

    const user = await User.findOne({
      where: {
        id: user_id,
        tenant_id: tenant_id,
        status: "ACTIVE",
      },
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "fetched user successfully",
      data: user,
    });
  } catch (err) {
    console.log("failed to get user", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserByBranch = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    // ADMIN / SUPER_ADMIN:
    // use branch selected/requested from URL
    //
    // BRANCH_ADMIN:
    // NEVER trust branch_id from URL.
    // Always use their own assigned branch.
    const branch_id =
      req.user.role === "BRANCH_ADMIN" ? req.user.branch_id : req.params.id;

    if (!branch_id) {
      return res.status(400).json({
        success: false,
        message: "Branch is required",
      });
    }

    // Check that branch belongs to this tenant
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

    const users = await User.findAll({
      where: {
        tenant_id: tenant_id,
        branch_id: branch_id,
        status: "ACTIVE",
      },
      attributes: {
        exclude: ["password"],
      },
    });

    // IMPORTANT:
    // Empty branch is NOT an error.
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully from the particular branch",
      data: users,
    });
  } catch (err) {
    console.log("failed to get users from branch", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const result = updateUserSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: result.error.issues,
      });
    }

    const tenant_id = req.user.tenant_id;
    const user_id = req.params.id;

    const user = await User.findOne({
      where: {
        tenant_id: tenant_id,
        id: user_id,
        status: "ACTIVE",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (result.data.email) {
      const existingUser = await User.findOne({
        where: {
          tenant_id: tenant_id,
          email: result.data.email,
          status: "ACTIVE",
        },
      });

      if (existingUser && existingUser.id !== user_id) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (result.data.password) {
      const passwordHashed = await bcrypt.hash(result.data.password, 10);
      result.data.password = passwordHashed;
    }

    await user.update(result.data);

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.log("failed to update user", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const user_id = req.params.id;

    const user = await User.findOne({
      where: {
        id: user_id,
        tenant_id: tenant_id,
        status: "ACTIVE",
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.update({
      status: "INACTIVE",
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.log("failed to delete user", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

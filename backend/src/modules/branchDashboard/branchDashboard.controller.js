import { Op } from "sequelize";
import { Member, Attendance } from "../../model/index.js";

export const getBranchDashboard = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const branch_id = req.user.branch_id;

    if (req.user.role !== "BRANCH_ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Only Branch Admin can access branch dashboard",
      });
    }

    if (!tenant_id) {
      return res.status(403).json({
        success: false,
        message: "Branch Admin is not associated with any tenant",
      });
    }

    if (!branch_id) {
      return res.status(403).json({
        success: false,
        message: "Branch Admin is not associated with any branch",
      });
    }

    const totalMembers = await Member.count({
      where: {
        tenant_id,
        branch_id,
      },
    });

    const activeMembers = await Member.count({
      where: {
        tenant_id,
        branch_id,
        status: "ACTIVE",
      },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.count({
      where: {
        tenant_id,
        branch_id,

        check_in_time: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const recentMembers = await Member.findAll({
      where: {
        tenant_id,
        branch_id,
      },

      attributes: ["id", "name", "phone", "email", "status", "joining_date"],

      order: [["joining_date", "DESC"]],

      limit: 5,
    });

    const recentAttendance = await Attendance.findAll({
      where: {
        tenant_id,
        branch_id,
      },

      include: [
        {
          model: Member,
          attributes: ["id", "name", "phone"],
        },
      ],

      order: [["check_in_time", "DESC"]],

      limit: 10,
    });

    return res.status(200).json({
      success: true,
      message: "Branch dashboard fetched successfully",

      data: {
        stats: {
          totalMembers,
          activeMembers,
          todayAttendance,
        },

        recentMembers,

        recentAttendance,
      },
    });
  } catch (err) {
    console.error("Error fetching branch dashboard:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

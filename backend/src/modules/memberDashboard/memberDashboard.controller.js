import {
  Member,
  MemberMembership,
  MemberSlots,
  Attendance,
  Measurement,
  Goal,
  HealthProfile,
  DietPlan,
  DietPlanMeal,
  Branch,
} from "../../model/index.js";

import { Op } from "sequelize";

// Finds the logged-in member from the token (member_id if present, else user_id)
const findLoggedInMember = (req, attributes) =>
  Member.findOne({
    where: {
      tenant_id: req.user.tenant_id,
      ...(req.user.member_id
        ? { id: req.user.member_id }
        : { user_id: req.user.id }),
    },
    ...(attributes && { attributes }),
  });

// =====================================================
// MEMBER DASHBOARD
// =====================================================

export const getMemberDashboard = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    // 1. MEMBER
    const member = await findLoggedInMember(req, [
      "id",
      "user_id",
      "tenant_id",
      "branch_id",
      "name",
      "phone",
      "email",
      "date_of_birth",
      "gender",
      "profile_image",
      "address",
      "emergency_contact_name",
      "emergency_contact_phone",
      "joining_date",
      "status",
    ]);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const member_id = member.id;
    const branch_id = member.branch_id;

    // 2. BRANCH
    const branch = await Branch.findOne({
      where: { id: branch_id, tenant_id },
      attributes: [
        "id",
        "tenant_id",
        "name",
        "code",
        "phone",
        "email",
        "address_line",
        "city",
        "state",
        "postal_code",
        "country",
        "opening_time",
        "closing_time",
        "status",
        "capacity",
      ],
    });

    // 3. MEMBERSHIP (latest)
    const membership = await MemberMembership.findOne({
      where: { member_id, tenant_id },
      order: [["created_at", "DESC"]],
    });

    // 4. SLOT (current + history)
    const allSlots = await MemberSlots.findAll({
      where: { member_id, tenant_id },
      order: [
        ["is_active", "DESC"],
        ["created_at", "DESC"],
      ],
    });
    const slot = allSlots.find((s) => s.is_active) || null;
    const slotHistory = allSlots.filter((s) => !s.is_active);

    // 5. ATTENDANCE
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const nextMonth = new Date(monthStart);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const todayAttendance = await Attendance.findOne({
      where: {
        member_id,
        tenant_id,
        check_in_time: { [Op.between]: [todayStart, todayEnd] },
      },
      order: [["check_in_time", "DESC"]],
    });

    const totalAttendance = await Attendance.count({
      where: { member_id, tenant_id },
    });

    const monthlyAttendance = await Attendance.count({
      where: {
        member_id,
        tenant_id,
        check_in_time: { [Op.gte]: monthStart, [Op.lt]: nextMonth },
      },
    });

    const recentAttendance = await Attendance.findAll({
      where: { member_id, tenant_id },
      order: [["check_in_time", "DESC"]],
      limit: 7,
    });

    // 6. MEASUREMENTS + PROGRESS
    const [latestMeasurement, previousMeasurement] = await Measurement.findAll({
      where: { member_id, tenant_id },
      order: [["measured_at", "DESC"]],
      limit: 2,
    });

    const weightChange =
      latestMeasurement && previousMeasurement
        ? Number(latestMeasurement.weight) - Number(previousMeasurement.weight)
        : null;

    // 7. GOALS
    const activeGoals = await Goal.findAll({
      where: { member_id, tenant_id, status: "ACTIVE" },
      order: [["target_date", "ASC"]],
    });

    // 8. HEALTH PROFILE
    const healthProfile = await HealthProfile.findOne({
      where: { member_id, tenant_id },
    });

    // 9. ACTIVE DIET PLAN + MEALS
    const activeDietPlan = await DietPlan.findOne({
      where: { member_id, tenant_id, status: "ACTIVE" },
      order: [["created_at", "DESC"]],
    });

    const dietMeals = activeDietPlan
      ? await DietPlanMeal.findAll({
          where: { diet_plan_id: activeDietPlan.id },
          order: [["meal_time", "ASC"]],
        })
      : [];

    // 10. RESPONSE
    return res.status(200).json({
      success: true,
      message: "Member dashboard fetched successfully",
      data: {
        member,
        branch,
        membership,
        slot,
        slot_history: slotHistory,
        attendance: {
          today: todayAttendance,
          total: totalAttendance,
          this_month: monthlyAttendance,
          recent: recentAttendance,
        },
        progress: {
          latest_measurement: latestMeasurement || null,
          previous_measurement: previousMeasurement || null,
          weight_change: weightChange,
        },
        goals: activeGoals,
        health_profile: healthProfile,
        diet_plan: activeDietPlan,
        diet_meals: dietMeals,
      },
    });
  } catch (err) {
    console.error("Error in getMemberDashboard:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// MY ATTENDANCE (month wise history)
// =====================================================

export const getMyAttendance = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const member = await findLoggedInMember(req, ["id"]);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    // month = YYYY-MM, default: current month
    const monthParam = req.query.month || new Date().toISOString().slice(0, 7);
    const [y, m] = monthParam.split("-").map(Number);

    if (!y || !m || m < 1 || m > 12) {
      return res.status(400).json({ success: false, message: "Invalid month" });
    }

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    const records = await Attendance.findAll({
      where: {
        member_id: member.id,
        tenant_id,
        check_in_time: { [Op.gte]: start, [Op.lt]: end },
      },
      order: [["check_in_time", "DESC"]],
    });

    const total_visits = await Attendance.count({
      where: { member_id: member.id, tenant_id },
    });

    const days_attended = new Set(
      records.map((r) => new Date(r.check_in_time).toDateString())
    ).size;

    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: {
        month: monthParam,
        records,
        summary: {
          visits_this_month: records.length,
          days_attended,
          total_visits,
        },
      },
    });
  } catch (err) {
    console.error("Error in getMyAttendance:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyGoals = async(req,res)=>{
  try{
    const tenant_id = req.user.tenant_id;
    const member_id = req.params.member_id;

    const goals = await Goal.findAll({
      where:{
        member_id,
        tenant_id
      }
    })

    if(goals.length === 0){
      return res.status(404).json({success:false,message:"No goals found"})
    }

    return res.status(200).json({
      success:true,
      message:"Goals fetched successfully",
      data:goals
    })

  }
  catch(err){
    console.log("error in getMyGoals",err)
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
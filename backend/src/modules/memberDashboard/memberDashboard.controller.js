import {
  Member,
  MembershipPlan,
  MemberMembership,
  MemberSlots,
  Attendance,
  Measurement,
  Goal,
  HealthProfile,
  DietPlan,
  DietPlanMeal,
  WorkoutPlan,
  WorkoutPlanExercise,
  Exercise,
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

// Single source of truth for membership day-math, so dashboard and the
// dedicated my-membership endpoint never drift apart again.
// Always zeroes out time-of-day before diffing — otherwise Math.ceil()
// silently adds a phantom extra day depending on what time "now" is.
const computeMembershipMeta = (membership) => {
  if (!membership) {
    return { days_remaining: null, is_expired: null, freeze_days_remaining: null };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(membership.end_date);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const is_expired = days_remaining < 0;

  let freeze_days_remaining = null;
  if (membership.status === "FROZEN" && membership.freeze_end_date) {
    const freezeEnd = new Date(membership.freeze_end_date);
    freezeEnd.setHours(0, 0, 0, 0);
    freeze_days_remaining = Math.ceil(
      (freezeEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return { days_remaining, is_expired, freeze_days_remaining };
};

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

    // 3. MEMBERSHIP (latest, same ACTIVE/FROZEN-preference + day-math as getMyMembership)
    const allMemberships = await MemberMembership.findAll({
      where: { member_id, tenant_id },
      include: [
        {
          model: MembershipPlan,
          attributes: [
            "id",
            "name",
            "description",
            "duration",
            "duration_unit",
            "access_type",
            "status",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const membership =
      allMemberships.find((m) => m.status === "ACTIVE" || m.status === "FROZEN") ||
      allMemberships[0] ||
      null;

    const membershipMeta = computeMembershipMeta(membership);

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
        membership_meta: membershipMeta, // { days_remaining, is_expired, freeze_days_remaining }
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

// Member Dashboard controller — fetches goals belonging to the logged-in
// member only (not all tenant goals, not a branch's goals — that's what
// getAllGoals / getBranchGoals already cover on the admin side).

export const getMyGoals = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    //  const member_id = req.user.id confirm: is a MEMBER's req.user.id the Member row id?

    const member = await Member.findOne({
      where: {
        user_id: req.user.id,
        tenant_id: req.user.tenant_id
      }
    });


    const member_id = member.id;
    const goals = await Goal.findAll({
    where: {
        tenant_id: req.user.tenant_id,
        member_id: member.id,
        status: {
            [Op.ne]: 'CANCELLED'
        }
    },
    order: [['target_date', 'ASC']]
});

    if (goals.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No goals found"
      })
    }

    return res.status(200).json({
      status: true,
      message: "Goals fetched successfully",
      data: goals
    })
  }
  catch (err) {
    console.log("Error in getMyGoals", err)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

// Lets a member log progress on their own goal by updating start_value
// (your schema tracks current progress via start_value, updated over time,
// rather than a separate current_value column — confirm that's intended).
export const logMyGoalProgress = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const member_id = req.user.id;
    const goal_id = req.params.id;
    const { start_value } = req.body;

    if (start_value === undefined) {
      return res.status(400).json({
        status: false,
        message: "start_value is required"
      })
    }

    const goal = await Goal.findOne({
      where: {
        id: goal_id,
        tenant_id: tenant_id,
        member_id: member_id,
        status: 'ACTIVE'
      }
    })

    if (!goal) {
      return res.status(404).json({
        status: false,
        message: "Goal not found"
      })
    }

    const isDone = start_value >= goal.target_value;

    await goal.update({
      start_value,
      status: isDone ? 'COMPLETED' : 'ACTIVE'
    })

    return res.status(200).json({
      status: true,
      message: "Progress updated successfully",
      data: goal
    })
  }
  catch (err) {
    console.log("Error in logMyGoalProgress", err)
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

// =====================================================
// MY DIET PLANS (self-service, read side)
// Mirrors getDietPlansByMember (admin side) but resolves the
// member from the logged-in token instead of a URL param.
// =====================================================

export const getMyDietPlans = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const member = await findLoggedInMember(req, ["id"]);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const dietPlans = await DietPlan.findAll({
      where: { member_id: member.id, tenant_id },
      include: [{ model: DietPlanMeal }],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Diet plans fetched successfully",
      data: dietPlans,
    });
  } catch (err) {
    console.error("Error in getMyDietPlans:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// MY WORKOUT PLANS (self-service, read side)
// Mirrors getWorkoutPlansByMember (admin side) but resolves the
// member from the logged-in token instead of a URL param.
// =====================================================

export const getMyWorkoutPlans = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const member = await findLoggedInMember(req, ["id"]);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const workoutPlans = await WorkoutPlan.findAll({
      where: { member_id: member.id, tenant_id },
      include: [
        {
          model: WorkoutPlanExercise,
          include: [{ model: Exercise, attributes: ["id", "name", "muscle_group", "category", "equipment"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Workout plans fetched successfully",
      data: workoutPlans,
    });
  } catch (err) {
    console.error("Error in getMyWorkoutPlans:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================================
// MY MEMBERSHIP (self-service, read side)
// Fetches the logged-in member's current + past memberships,
// with plan details and a computed days_remaining.
// =====================================================

export const getMyMembership = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;

    const member = await findLoggedInMember(req, ["id"]);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    const memberships = await MemberMembership.findAll({
      where: { member_id: member.id, tenant_id },
      include: [
        {
          model: MembershipPlan,
          attributes: [
            "id",
            "name",
            "description",
            "duration",
            "duration_unit",
            "access_type",
            "status",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    if (memberships.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No membership found",
      });
    }

    const currentMembership =
      memberships.find((m) => m.status === "ACTIVE" || m.status === "FROZEN") ||
      memberships[0];

    const membershipHistory = memberships.filter(
      (m) => m.id !== currentMembership.id
    );

    const { days_remaining, is_expired, freeze_days_remaining } =
      computeMembershipMeta(currentMembership);

    return res.status(200).json({
      success: true,
      message: "Membership fetched successfully",
      data: {
        current: currentMembership,
        days_remaining,
        is_expired,
        freeze_days_remaining,
        history: membershipHistory,
      },
    });
  } catch (err) {
    console.error("Error in getMyMembership:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
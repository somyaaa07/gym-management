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
    Branch
} from "../../model/index.js";

import { Op } from "sequelize";


export const getMemberDashboard = async (req, res) => {
    try {

        const tenant_id = req.user.tenant_id;

        /*
         * IMPORTANT:
         * Use the member_id stored in JWT if you have it.
         *
         * If your member login JWT stores the member UUID
         * in req.user.id instead, change this to:
         *
         * const member_id = req.user.id;
         */



        // =====================================================
        // 1. MEMBER
        // =====================================================

        const member = await Member.findOne({
            where: {

                tenant_id, ...(req.user.member_id
                    ? { id: req.user.member_id }   
                    : { user_id: req.user.id }),
            },
            attributes: [
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
                "status"
            ]
        });


        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }
        const member_id = member.id;
        const branch_id = member.branch_id;


        // =====================================================
        // 2. BRANCH
        // =====================================================

        const branch = await Branch.findOne({
            where: {
                id: branch_id,
                tenant_id
            },
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
                "capacity"
            ]
        });


        // =====================================================
        // 3. MEMBERSHIP
        // =====================================================

        const membership = await MemberMembership.findOne({
            where: {
                member_id,
                tenant_id
            },
            order: [
                ["created_at", "DESC"]
            ]
        });


        // =====================================================
        // 4. MEMBER SLOT
        // =====================================================

        const slot = await MemberSlots.findOne({
            where: {
                member_id,
                tenant_id,
                branch_id
            }
        });


        // =====================================================
        // 5. TODAY ATTENDANCE
        // =====================================================

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);


        const todayAttendance = await Attendance.findOne({
            where: {
                member_id,
                tenant_id,
                branch_id,
                check_in_time: {
                    [Op.between]: [
                        todayStart,
                        todayEnd
                    ]
                }
            },
            order: [
                ["check_in_time", "DESC"]
            ]
        });


        // =====================================================
        // 6. ATTENDANCE SUMMARY
        // =====================================================

        const totalAttendance = await Attendance.count({
            where: {
                member_id,
                tenant_id,
                branch_id
            }
        });


        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);


        const nextMonth = new Date(monthStart);
        nextMonth.setMonth(nextMonth.getMonth() + 1);


        const monthlyAttendance = await Attendance.count({
            where: {
                member_id,
                tenant_id,
                branch_id,
                check_in_time: {
                    [Op.gte]: monthStart,
                    [Op.lt]: nextMonth
                }
            }
        });


        // =====================================================
        // 7. RECENT ATTENDANCE
        // =====================================================

        const recentAttendance = await Attendance.findAll({
            where: {
                member_id,
                tenant_id,
                branch_id
            },
            order: [
                ["check_in_time", "DESC"]
            ],
            limit: 7
        });


        // =====================================================
        // 8. LATEST MEASUREMENT
        // =====================================================

        const latestMeasurement = await Measurement.findOne({
            where: {
                member_id,
                tenant_id,
                branch_id
            },
            order: [
                ["measured_at", "DESC"]
            ]
        });


        // =====================================================
        // 9. PREVIOUS MEASUREMENT
        // =====================================================

        const previousMeasurement = await Measurement.findOne({
            where: {
                member_id,
                tenant_id,
                branch_id
            },
            order: [
                ["measured_at", "DESC"]
            ],
            offset: 1
        });


        // =====================================================
        // 10. PROGRESS
        // =====================================================

        let weightChange = null;

        if (
            latestMeasurement &&
            previousMeasurement
        ) {
            weightChange =
                Number(latestMeasurement.weight) -
                Number(previousMeasurement.weight);
        }


        // =====================================================
        // 11. GOALS
        // =====================================================

        const activeGoals = await Goal.findAll({
            where: {
                member_id,
                tenant_id,
                branch_id,
                status: "ACTIVE"
            },
            order: [
                ["target_date", "ASC"]
            ]
        });


        // =====================================================
        // 12. HEALTH PROFILE
        // =====================================================

        const healthProfile = await HealthProfile.findOne({
            where: {
                member_id,
                tenant_id,
                branch_id
            }
        });


        // =====================================================
        // 13. ACTIVE DIET PLAN
        // =====================================================

        const activeDietPlan = await DietPlan.findOne({
            where: {
                member_id,
                tenant_id,
                branch_id,
                status: "ACTIVE"
            },
            order: [
                ["created_at", "DESC"]
            ]
        });


        // =====================================================
        // 14. DIET PLAN MEALS
        // =====================================================

        let dietMeals = [];

        if (activeDietPlan) {

            dietMeals = await DietPlanMeal.findAll({
                where: {
                    diet_plan_id: activeDietPlan.id
                },
                order: [
                    ["meal_time", "ASC"]
                ]
            });

        }


        // =====================================================
        // 15. RESPONSE
        // =====================================================

        return res.status(200).json({

            success: true,

            message: "Member dashboard fetched successfully",

            data: {

                member,

                branch,

                membership,

                slot,

                attendance: {
                    today: todayAttendance,
                    total: totalAttendance,
                    this_month: monthlyAttendance,
                    recent: recentAttendance
                },

                progress: {
                    latest_measurement: latestMeasurement,
                    previous_measurement: previousMeasurement,
                    weight_change: weightChange
                },

                goals: activeGoals,

                health_profile: healthProfile,

                diet_plan: activeDietPlan,

                diet_meals: dietMeals

            }
        });

    } catch (err) {

        console.error(
            "Error in getMemberDashboard:",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
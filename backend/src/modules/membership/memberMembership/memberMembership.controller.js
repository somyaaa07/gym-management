import { Member, MemberMembership, MembershipPlan } from '../../../model/index.js';
import { memberMembershipSchema, updateMemberMembershipSchema, freezeMemberMembershipSchema } from './memberMembership.validation.js';

export const createMemberMembership = async (req, res) => {
    try {
        const result = memberMembershipSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                error: result.error.issues
            })
        }

        const { member_id, membership_plan_id, start_date, discount, payment_status, auto_renew, freeze_start_date, freeze_end_date } = result.data;
        const tenant_id = req.user.tenant_id;

        const member = await Member.findOne({
            where: {
                id: member_id,
                tenant_id: tenant_id
            }
        })

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            })
        }

        const membershipPlan = await MembershipPlan.findOne({
            where: {
                id: membership_plan_id,
                tenant_id: tenant_id,
                status: 'ACTIVE'
            }
        })

        if (!membershipPlan) {
            return res.status(404).json({
                success: false,
                message: "Membership Plan not found"
            })
        }

        const price1 = Number(membershipPlan.price);
        const discount1 = discount ?? 0;

        //discount validation
        if (discount1 > price1) {
            return res.status(400).json({
                success: false,
                message: "Discount cannot be greater than price"
            })
        }
        const final_amount = price1 - discount1;

        const startDate = new Date(start_date);
        const endDate = new Date(start_date);

        const duration = membershipPlan.duration;
        const duration_unit = membershipPlan.duration_unit;

        if (duration_unit === 'DAYS') {
            endDate.setDate(
                endDate.getDate() + duration
            );
        }

        else if (duration_unit === 'WEEKS') {
            endDate.setDate(
                endDate.getDate() + (duration * 7)
            );
        }

        else if (duration_unit === 'MONTHS') {
            endDate.setMonth(
                endDate.getMonth() + duration
            );
        }

        else if (duration_unit === 'YEARS') {
            endDate.setFullYear(
                endDate.getFullYear() + duration
            );
        }

        const memberMembership = await MemberMembership.create({
            tenant_id: tenant_id,
            member_id: member_id,
            membership_plan_id: membership_plan_id,
            start_date: startDate,
            end_date: endDate,
            price: price1,
            discount: discount1,
            final_amount: final_amount,
            payment_status: payment_status,
            auto_renew: auto_renew ?? false,
            freeze_start_date: freeze_start_date,
            freeze_end_date: freeze_end_date,
        })
        return res.status(201).json({
            success: true,
            message: "member membership created successfully",
            data: {
                member_id: memberMembership.member_id,
                membership_plan_id: memberMembership.membership_plan_id,
                start_date: memberMembership.start_date,
                end_date: memberMembership.end_date,
                price: memberMembership.price,
                discount: memberMembership.discount,
                final_amount: memberMembership.final_amount,
                payment_status: memberMembership.payment_status,
                auto_renew: memberMembership.auto_renew,
                freeze_start_date: memberMembership.freeze_start_date,
                freeze_end_date: memberMembership.freeze_end_date,
            }
        })
    }
    catch (err) {
        console.log("failed to creating the member's membership", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// particular members all memberships
export const getMemberMemberships = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const member_id = req.params.member_id;

        const member = await Member.findOne({
            where: {
                id: member_id,
                tenant_id: tenant_id,
            }

        })

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            })
        }

        const memberMemberships = await MemberMembership.findAll({
            where: {
                tenant_id,
                member_id: member_id
            },
            include: [{
                model: Member,
                attributes: ["id", "name"]


            },
            {
                model: MembershipPlan
            }]
        })
        if (memberMemberships.length === 0) {
            return res.status(404).json({
                success: false,
                message: "the member has no memberships found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Member's all memberships are being fetched",
            data: memberMemberships
        })
    }
    catch (err) {
        console.log("failed to fetching the member's all memberships", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// get all the memberships of the particular tenant

export const getAllMemberships = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const memberships = await MemberMembership.findAll({
            where: {
                tenant_id
            },
            include: [{
                model: Member,
                //   as:"member",
                include: [{
                    model: MembershipPlan,
                    // as:"membershipPlan",
                }]
            }]
        })

        if (memberships.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No memberships found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "All memberships are being fetched",
            data: memberships
        })
    }
    catch (err) {
        console.log("failed to fetching the all memberships", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


//particular membership for example basic, premium etc .
export const getMemberMembershipById = async (req, res) => {
    try {
        const membership_id = req.params.id;
        const tenant_id = req.user.tenant_id;

        const specificMembership = await MemberMembership.findOne({
            where: {
                id: membership_id,
                tenant_id
            },
            include: [{ model: Member, attributes: ["id", "name"] }, {
                model: MembershipPlan
            }]
        })

        if (!specificMembership) {
            return res.status(404).json({
                success: false,
                message: "No membership found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Membership is being fetched successfully",
            data: specificMembership
        })
    }
    catch (err) {
        console.log("failed to fetching the specific membership", err)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const updateMemberMembership = async (req, res) => {
    try {
        const result = updateMemberMembershipSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: result.error.issues
            });
        }

        const {
            payment_status,
            auto_renew,
            discount,
            // freeze_start_date,
            // freeze_end_date
        } = result.data;

        const tenant_id = req.user.tenant_id;
        const membership_id = req.params.id;

        // Find membership
        const membership = await MemberMembership.findOne({
            where: {
                id: membership_id,
                tenant_id
            }
        });

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            });
        }

        // Existing price
        const price = Number(membership.price);

        // Keep old values if field is not provided
        const newDiscount =
            discount !== undefined
                ? Number(discount)
                : Number(membership.discount);

        const newPaymentStatus =
            payment_status !== undefined
                ? payment_status
                : membership.payment_status;

        const newAutoRenew =
            auto_renew !== undefined
                ? auto_renew
                : membership.auto_renew;

        // const newFreezeStartDate =
        //     freeze_start_date !== undefined
        //         ? freeze_start_date
        //         : membership.freeze_start_date;

        // const newFreezeEndDate =
        //     freeze_end_date !== undefined
        //         ? freeze_end_date
        //         : membership.freeze_end_date;

        // Discount validation
        if (newDiscount < 0) {
            return res.status(400).json({
                success: false,
                message: "Discount cannot be negative"
            });
        }

        if (newDiscount > price) {
            return res.status(400).json({
                success: false,
                message: "Discount cannot be greater than price"
            });
        }

        // Freeze date validation
        // if (newFreezeStartDate && newFreezeEndDate) {
        //     const freezeStart = new Date(newFreezeStartDate);
        //     const freezeEnd = new Date(newFreezeEndDate);

        //     if (freezeEnd < freezeStart) {
        //         return res.status(400).json({
        //             success: false,
        //             message: "Freeze start date cannot be greater than freeze end date"
        //         });
        //     }
        // }

        // Calculate final amount
        const final_amount = price - newDiscount;

        // Update membership
        await membership.update({
            payment_status: newPaymentStatus,
            auto_renew: newAutoRenew,
            discount: newDiscount,
            // freeze_start_date: newFreezeStartDate,
            // freeze_end_date: newFreezeEndDate,
            final_amount
        });

        return res.status(200).json({
            success: true,
            message: "Member membership updated successfully",
            data: {
                id: membership.id,
                member_id: membership.member_id,
                membership_plan_id: membership.membership_plan_id,
                price: membership.price,
                start_date: membership.start_date,
                end_date: membership.end_date,
                payment_status: membership.payment_status,
                auto_renew: membership.auto_renew,
                discount: membership.discount,
                final_amount: membership.final_amount,
                // freeze_start_date: membership.freeze_start_date,
                // freeze_end_date: membership.freeze_end_date,
                status: membership.status
            }
        });

    } catch (err) {
        console.log(
            "failed in updating the member's membership",
            err
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const deactivateMemberMembership = async (req, res) => {
    try {
        const membership_id = req.params.id;
        const tenant_id = req.user.tenant_id;

        const membership = await MemberMembership.findOne({
            where: {
                id: membership_id,
                tenant_id
            }
        })

        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "did'nt find the membership"
            })
        }

        const status = membership.status

        if (status === 'DEACTIVE') {
            return res.status(400).json({
                success: false,
                message: "membership is already deactivated"
            })
        }

        await membership.update({
            status: "DEACTIVE",
            auto_renew: false
        })

        return res.status(200).json({
            success: true,
            message: "membership has been deactivated"
        })
    }

    catch (err) {
        console.log("failed in deactivation of the membership plan", err)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const freezeMemberMembership = async (req, res) => {
    try {
        const result = freezeMemberMembershipSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: result.error.issues
            })
        }

        const { freeze_start_date, freeze_end_date } = result.data;

        const tenant_id = req.user.tenant_id;
        const membership_id = req.params.id;

        const membership = await MemberMembership.findOne({
            where: {
                id: membership_id,
                tenant_id: tenant_id,

            }
        })
        if (!membership) {
            return res.status(404).json({
                success: false,
                message: "Membership not found"
            })
        }

        const status = membership.status;

        if (status === 'DEACTIVE') {
            return res.status(400).json({
                success: false,
                message: "Deactivated membership cannot be frozen"
            })
        }

        if (status === 'FROZEN') {
            return res.status(400).json({
                success: false,
                message: "Membership already frozen"
            })
        }

        if (freeze_start_date > freeze_end_date) {
            return res.status(400).json({
                success: false,
                message: "Freeze start date cannot be greater than freeze end date"
            })
        }

        const difference = freeze_end_date.getTime() - freeze_start_date.getTime();

        const freezeDays = Math.floor(difference / (1000 * 60 * 60 * 24) + 1);

        const newEndDate = new Date(membership.end_date);

        newEndDate.setDate(newEndDate.getDate() + freezeDays);

        await membership.update({

            freeze_start_date: freeze_start_date,
            freeze_end_date: freeze_end_date,
            // freeze_days: freezeDays,
            end_date: newEndDate,
            status: 'FROZEN'

        },
            {
                where: {
                    id: membership_id,
                    tenant_id
                }
            })

        return res.status(200).json({
            success: true,
            message: "Membership frozen successfully",
            data: {
                id: membership.id,
                member_id: membership.member_id,
                membership_plan_id: membership.membership_plan_id,

                start_date: membership.start_date,
                end_date: membership.end_date,

                freeze_start_date: membership.freeze_start_date,
                freeze_end_date: membership.freeze_end_date,
                // freeze_days: membership.freeze_days,

                status: membership.status
            }
        });
    }
    catch (err) {
        console.log("Error in freezing membership", err)
        return res.status(500).json({
            success: false,
            message: "Internal server Error"
        })
    }
}
import nodeCron from "node-cron";
import MemberMembership  from "../model/memberMembershipModel.js";

nodeCron.schedule("* * * * *", async () => {
    console.log("Freeze membership cron is running...");
    try {
        const today = new Date();

        const frozenMemberships = await MemberMembership.findAll({
            where: {
                status: "FROZEN"
            }
        });

        for (const membership of frozenMemberships) {

            const freezeEndDate = new Date(membership.freeze_end_date);

            if (freezeEndDate < today) {

                await membership.update({
                    status: "ACTIVE",
                    freeze_start_date: null,
                    freeze_end_date: null
                });

                console.log(
                    `Membership ${membership.id} is now ACTIVE`
                );
            }
        }

    } catch (error) {
        console.log(
            "Error in freeze membership cron job:",
            error
        );
    }
});
import nodeCron from "node-cron";
import MemberMembership from "../model/memberMembershipModel.js";

nodeCron.schedule("*/5 * * * *", async () => {   // har 1 min ki jagah har 5 min
    console.log("Freeze membership cron is running...");
    try {
        const today = new Date();

        const frozenMemberships = await MemberMembership.findAll({
            where: { status: "FROZEN" }
        });

        for (const membership of frozenMemberships) {
            const freezeEndDate = new Date(membership.freeze_end_date);

            if (freezeEndDate < today) {
                await membership.update({
                    status: "ACTIVE",
                    freeze_start_date: null,
                    freeze_end_date: null
                });
                console.log(`Membership ${membership.id} is now ACTIVE`);
            }
        }
    } catch (error) {
        console.log("Error in freeze membership cron job:", error);
    }
}, {
    noOverlap: true   // agar node-cron version supports kare, previous run khatam hone tak agla trigger na ho
});
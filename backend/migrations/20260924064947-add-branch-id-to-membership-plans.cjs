"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn(
            "membership_plans",
            "branch_id",
            {
                type: Sequelize.UUID,
                allowNull: true,
                after: "tenant_id"
            }
        );
    },

    async down(queryInterface) {
        await queryInterface.removeColumn(
            "membership_plans",
            "branch_id"
        );
    }
};
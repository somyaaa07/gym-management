'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM(
                'SUPER_ADMIN',
                'ADMIN',
                'BRANCH_ADMIN',
                'MANAGER',
                'TRAINER',
                'RECEPTIONIST',
                'ACCOUNTANT',
                'MEMBER'
            ),
            allowNull: false,
            defaultValue: 'ADMIN'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('users', 'role', {
            type: Sequelize.ENUM(
                'SUPER_ADMIN',
                'ADMIN',
                'MANAGER',
                'TRAINER',
                'RECEPTIONIST',
                'ACCOUNTANT',
                'MEMBER'
            ),
            allowNull: false,
            defaultValue: 'ADMIN'
        });
    }
};
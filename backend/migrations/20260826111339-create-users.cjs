'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            tenant_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'tenant',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            branch_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('SUPER_ADMIN',
                    'ADMIN',
                    'MANAGER',
                    'TRAINER',
                    'RECEPTIONIST',
                    'ACCOUNTANT'),
                defaultValue: 'ADMIN'
            },
            status: {
                type: Sequelize.ENUM('ACTIVE',
                    'INACTIVE',
                    'SUSPENDED'),
                defaultValue: 'ACTIVE'
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users')
    }
};

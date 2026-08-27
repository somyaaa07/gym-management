'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tenant', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      address_line: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      postal_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'India',
      },

      status: {
        type: Sequelize.ENUM(
          'ACTIVE',
          'SUSPENDED',
          'CANCELLED'
        ),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },

      subscription_plan: {
        type: Sequelize.ENUM(
          'TRIAL',
          'BASIC',
          'PRO',
          'ENTERPRISE'
        ),
        allowNull: false,
        defaultValue: 'TRIAL',
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tenant');
  },
};
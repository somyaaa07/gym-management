'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  
    await queryInterface.createTable('attendance_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references:{
          model:'tenants',
          key:'id'
        },
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
      },
      grace_period_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10
      },
      early_leave_threshold_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    })

  },

  async down(queryInterface, Sequelize) {
  
    await queryInterface.dropTable('attendance_rules')
  }
};

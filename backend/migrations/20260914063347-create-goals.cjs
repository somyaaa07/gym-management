'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('goals', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      tenant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'

      },
      branch_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      member_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'members',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      goal_type: {
        type: Sequelize.ENUM('WEIGHT_LOSS',
           'WEIGHT_GAIN',
            'FAT_LOSS', 
            'MUSCLE_GAIN', 
            'STRENGTH', 
            'FITNESS'),
        defaultValue: 'WEIGHT_LOSS',
        allowNull: false
      },
      target_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      target_unit: {
        type: Sequelize.ENUM(
          'KG',
          'PERCENT',
          'REPS',
          'MINUTES'
        ),
        defaultValue: 'KG',
        allowNull: false
      },
      start_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      target_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'ACTIVE',
          'CANCELLED',
          'COMPLETED',
        ),
        defaultValue: 'ACTIVE',
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('goals');
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

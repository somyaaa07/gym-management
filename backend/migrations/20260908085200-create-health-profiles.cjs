'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('health_profiles',{
          id:{
        type:Sequelize.UUID,
        defaultValue:Sequelize.UUIDV4,
        primaryKey:true,
        
    },
    tenant_id:{
        type:Sequelize.UUID,
        allowNull:false,
        references:{
          model:'tenants',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
    },
    branch_id:{
        type:Sequelize.UUID,
        allowNull:false,
        references:{
          model:'branches',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
    },
    member_id:{
        type:Sequelize.UUID,
        allowNull:false,
        unique:true,
        references:{
          model:'members',
          key:'id'
        },
        onUpdate:'CASCADE',
        onDelete:'CASCADE'
    },
    blood_group:{
        type:Sequelize.ENUM("A+","B+","O+","AB+","A-","B-","O-","AB-"),
       
        allowNull:true
    },
    medical_condition:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    allergies:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    current_medication:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    injury_history:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    exercise_restriction:{
        type:Sequelize.TEXT,
        allowNull:true

    },
    doctor_clearance:{
        type:Sequelize.BOOLEAN,
        defaultValue:false,
        allowNull:true
    },
    doctor_notes:{
        type:Sequelize.TEXT,
        allowNull:true
    },
    health_risk_level:{
        type:Sequelize.ENUM("LOW","MEDIUM","HIGH"),
        allowNull:true
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

  async down (queryInterface, Sequelize) {

    await queryInterface.dropTable('health_profiles')
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable('exercises',{
       id:{
              type:Sequelize.UUID,
              defaultValue:Sequelize.UUIDV4,
              primaryKey:true
          },
          tenant_id:{
              type:Sequelize.UUID,
              allowNull:false,
              references:{
                model:'tenants',
                key:'id'
              },
              onDelete:'CASCADE',
              onUpdate:'CASCADE'
          },
          name:{
              type:Sequelize.STRING,
              allowNull:false
          },
          description:{
              type:Sequelize.TEXT,
              allowNull:false
          },
          category:{
              type:Sequelize.ENUM(
                  'STRENGTH',
                  'CARDIO',
                  'FLEXIBILITY',
                  'MOBILITY'
              ),
              allowNull:false,
              defaultValue:'STRENGTH'
          },
          muscle_group:{
              type:Sequelize.ENUM(
                  'CHEST',
                  'BACK',
                  'SHOULDERS',
                  'BICEPS',
                  'TRICEPS',
                  'LEGS',
                  'GLUTES',
                  'ABS',
                  'FULL_BODY'
              ),
              allowNull:false
          },
          equipment:{
              type:Sequelize.STRING,
              allowNull:false,
              
          },
          difficulty:{
              type:Sequelize.ENUM(
                  'BEGINNER',
                  'INTERMEDIATE',
                  'ADVANCED'
              ),
              allowNull:false,
              defaultValue:'BEGINNER'
          },
          instructions:{
              type:Sequelize.TEXT,
              allowNull:false
          },
          video_url:{
              type:Sequelize.STRING,
              allowNull:true
          },
          status:{
              type:Sequelize.ENUM('ACTIVE','INACTIVE'),
              allowNull:false,
              defaultValue:'ACTIVE',
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('exercises')
  }
};

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

    await queryInterface.createTable('workout_plan_exercises', {
          id:{
              type:Sequelize.UUID,
              defaultValue:Sequelize.UUIDV4,
              primaryKey:true,
          },
          workout_plan_id:{
              type:Sequelize.UUID,
              allowNull:false,
              references:{
                  model:'workout_plans',
                  key:'id',
              }
          },
          exercise_id:{
              type:Sequelize.UUID,
              allowNull:false,
              references:{
                  model:'exercises',
                  key:'id',
              }
          },
          day:{
              type:Sequelize.STRING,
              allowNull:false,
          },
          sets:{
              type:Sequelize.INTEGER,
              allowNull:false,
          },
          reps:{
              type:Sequelize.INTEGER,
              allowNull:true,
          },
          duration:{
              type:Sequelize.INTEGER,
              allowNull:true,
          },
          rest_seconds:{
              type:Sequelize.INTEGER,
              allowNull:false,
          },
          notes:{
              type:Sequelize.TEXT,
              allowNull:true,
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
    await queryInterface.dropTable('workout_plan_exercises')
  }
};

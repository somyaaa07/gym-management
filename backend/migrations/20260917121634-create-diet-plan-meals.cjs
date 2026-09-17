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

    await queryInterface.createTable('diet_plan_meals',{
       id:{
              type:Sequelize.UUID,
              primaryKey:true,
              defaultValue:Sequelize.UUIDV4,
          },
          diet_plan_id:{
              type:Sequelize.UUID,
              allowNull:false,
              references:{
                model:"diet_plans",
                key:"id"
              },
              onUpdate:'CASCADE',
              onDelete:'CASCADE'
          },
          meal_type:{
              type:Sequelize.STRING,
              allowNull:false
          },
          meal_time:{
              type:Sequelize.TIME,
              allowNull:false
          },
          food_name:{
              type:Sequelize.STRING,
              allowNull:false
          },
          quantity:{
              type:Sequelize.DECIMAL,
              allowNull:false
          },
          unit:{
              type:Sequelize.STRING,
              allowNull:false
          },
          calories:{
              type:Sequelize.DECIMAL,
              allowNull:true
          },
          protein:{
              type:Sequelize.DECIMAL,
              allowNull:true
          },
          fat:{
              type:Sequelize.DECIMAL,
              allowNull:true
          },
          carbs:{
              type:Sequelize.DECIMAL,
              allowNull:true
          },
          fiber:{
              type:Sequelize.DECIMAL,
              allowNull:true
          },
          sugar:{
              type:Sequelize.DECIMAL,
              allowNull:true
          },
          notes:{
              type:Sequelize.TEXT,
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('diet_plan_meals');
  }
};

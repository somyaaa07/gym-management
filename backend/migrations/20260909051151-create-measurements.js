'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.createTable('measurements',{
        id:{
              type:Sequelize.UUID,
              defaultValue:Sequelize.UUIDV4,
              primaryKey:true,
              // unique:true
          },
          tenant_id:{
              type:Sequelize.UUID,
              allowNull:false,
              reference:{
                model:'tenants',
                key:'id'
              },
              onUpdate:"CASCADE",
              onDelete:'CASCADE'
          },
          branch_id:{
              type:Sequelize.UUID,
              allowNull:false,
              reference:{
                model:'branches',
                key:'id'
              },
              onUpdate:"CASCADE",
              onDelete:'CASCADE'
          },
          member_id:{
              type:Sequelize.UUID,
              allowNull:false,
              reference:{
                model:'members',
                key:'id'
              },
              onUpdate:"CASCADE",
              onDelete:'CASCADE'
          },
          height:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:false
          },
          weight:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:false
          },
          bmi:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
       
          // hip:{
          //     type:Sequelize.DECIMAL(5,2),
          //     allowNull:false
          // },
          body_fat:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
          muscle_mass:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
             waist:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
          chest:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
          arms:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
          thighs:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
          
          neck:{
              type:Sequelize.DECIMAL(5,2),
              allowNull:true
          },
          
      
          systolic_bp:{
              type:Sequelize.INTEGER,
              allowNull:true
          },
          diastolic_bp:{
              type:Sequelize.INTEGER,
              allowNull:true
          },
          
      
          measured_at:{
              type:Sequelize.DATE,
              allowNull:false
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

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('measurements');
  }
};

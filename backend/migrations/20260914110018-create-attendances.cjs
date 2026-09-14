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

    await queryInterface.createTable('attendances',{
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
          member_id:{
              type:Sequelize.UUID,
              allowNull:false,
              references:{
                model:'members',
                key:'id'
              },
              onDelete:'CASCADE',
              onUpdate:'CASCADE'
          },
          branch_id:{
              type:Sequelize.UUID,
              allowNull:false,
              references:{
                model:'branches',
                key:'id'
              },
              onDelete:'CASCADE',
              onUpdate:'CASCADE'
          },
          check_in_time:{
              type:Sequelize.DATE,
              allowNull:false
          },
          check_out_time:{
              type:Sequelize.DATE,
              allowNull:true
          },
          check_in_method:{
              type:Sequelize.ENUM('MANUAL','FACE'),
              allowNull:false,
          },
          check_out_method:{
              type:Sequelize.ENUM('MANUAL','FACE'),
              allowNull:true,
        
          },
          check_in_status:{
              type:Sequelize.ENUM('ON_TIME','LATE'),
              allowNull:false,
          },
          check_out_status:{
              type:Sequelize.ENUM('ON_TIME','EARLY_LEAVE'),
              allowNull:true,
          },
          verified_by:{
              type:Sequelize.UUID,
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

    await queryInterface.dropTable('attendances')
  }
};

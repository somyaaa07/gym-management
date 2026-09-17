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

    await queryInterface.createTable('diet_plans',{
       id:{
              type:Sequelize.UUID,
              defaultValue:Sequelize.UUIDV4,
              primaryKey:true,
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
          name:{
              type:Sequelize.STRING,
              allowNull:false,
          },
          description:{
              type:Sequelize.STRING,
              allowNull:true
          },
          goal:{
              type:Sequelize.STRING,
              allowNull:false
          },
          start_date:{
              type:Sequelize.DATEONLY,
              allowNull:false
          },
          end_date:{
              type:Sequelize.DATEONLY,
              allowNull:false
          },
          status:{
              type:Sequelize.ENUM('ACTIVE','INACTIVE','COMPLETED'),
              defaultValue:'ACTIVE',
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
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable('diet_plans')
  }
};

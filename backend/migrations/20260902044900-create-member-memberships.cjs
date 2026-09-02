'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('member_memberships',{
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
            onUpdate:'CASCADE',
            onDelete:'CASCADE'
        },
        member_id:{
            type:Sequelize.UUID,
            allowNull:false,
            references:
            {
              model:'members',
              key:'id'
            },
            onUpdate:'CASCADE',
            onDelete:'CASCADE'
        },
        membership_plan_id:{
            type:Sequelize.UUID,
            allowNull:false,
            references:{
              model:'membership_plans',
              key:'id'
            },
            onUpdate:'CASCADE',
            onDelete:'CASCADE'
        },
        start_date:{
            type:Sequelize.DATEONLY,
            allowNull:false
        },
        end_date:{
            type:Sequelize.DATEONLY,
            allowNull:false
        },
        price:{
            type:Sequelize.DECIMAL(10,2),
            allowNull:false
        },
        discount:{
            type:Sequelize.DECIMAL(10,2),
            allowNull:true,
            defaultValue:0
        },
        final_amount:{
            type:Sequelize.DECIMAL(10,2),
            allowNull:false
        },
        payment_status:{
            type:Sequelize.ENUM('PAID','PENDING','FAILED'),
            allowNull:false,
            defaultValue:'PENDING'
        },
        auto_renew:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        freeze_start_date:{
            type:Sequelize.DATEONLY,
            allowNull:true
        },
        freeze_end_date:{
            type:Sequelize.DATEONLY,
            allowNull:true
        },
            status:{
                type:Sequelize.ENUM(
                    'ACTIVE',
                    'DEACTIVE',
                    'FROZEN'
                ),
                allowNull:false,
                defaultValue:'ACTIVE'
            }
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('member_memberships')
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

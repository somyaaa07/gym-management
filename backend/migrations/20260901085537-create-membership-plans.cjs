'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('membership_plans',{
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
        name:{
            type:Sequelize.STRING,
            allowNull:false
        },
        description:{
            type:Sequelize.TEXT,
            allowNull:true
        },
        duration:{
            type:Sequelize.INTEGER,
            allowNull:false
        },
        duration_unit:{
            type:Sequelize.ENUM('DAYS','WEEKS','MONTHS','YEARS'),
            allowNull:false
        },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    
    discount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
       access_type: {
        type: Sequelize.ENUM(
            'SINGLE_BRANCH',
            'ALL_BRANCHES'
        ),
        allowNull: false,
        defaultValue: 'SINGLE_BRANCH'
    },
        status:{
            type:Sequelize.ENUM('ACTIVE','INACTIVE'),
            allowNull:false,
            defaultValue:'ACTIVE'
        },
        created_at: {
    type: Sequelize.DATE,
    allowNull: false
},

updated_at: {
    type: Sequelize.DATE,
    allowNull: false
}
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('membership_plans');
  }
};

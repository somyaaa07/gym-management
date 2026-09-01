'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('members',{
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
        name:{
            type:Sequelize.STRING,
            allowNull:false
        },
        phone:{
            type:Sequelize.STRING,
            allowNull:false
        },
        email:{
            type:Sequelize.STRING,
            allowNull:false
        },
        date_of_birth:{
            type:Sequelize.DATEONLY,
            allowNull:true
        },
        gender:{
            type:Sequelize.ENUM('female','male','other'),
            allowNull:true
        },
        profile_image:{
            type:Sequelize.STRING,
            allowNull:true
        },
        address:{
            type:Sequelize.STRING,
            allowNull:true
        },
        emergency_contact_name:{
            type:Sequelize.STRING,
            allowNull:true
        },
        emergency_contact_phone:{
            type:Sequelize.STRING,
            allowNull:true
        },
        joining_date:{
            type:Sequelize.DATEONLY,
            allowNull:false
        },
       status: {
    type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
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
   await queryInterface.dropTable('members')
  }
};

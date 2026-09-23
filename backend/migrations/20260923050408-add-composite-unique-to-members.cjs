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
     await queryInterface.addConstraint('members', {
    fields: ['tenant_id','email'], type: 'unique', name: 'unique_member_email_per_tenant'
  });
   await queryInterface.addConstraint('members', {
    fields: ['tenant_id','phone'], type: 'unique', name: 'unique_member_phone_per_tenant'
  });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeConstraint('members', 'unique_member_email_per_tenant');
  await queryInterface.removeConstraint('members', 'unique_member_phone_per_tenant');
  }
};

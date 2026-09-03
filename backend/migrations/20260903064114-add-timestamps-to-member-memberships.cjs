'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('member_memberships', 'created_at', {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});

await queryInterface.addColumn('member_memberships', 'updated_at', {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
});
  },

  async down (queryInterface, Sequelize) {
await queryInterface.removeColumn('member_memberships', 'created_at');
await queryInterface.removeColumn('member_memberships', 'updated_at');
  }
};

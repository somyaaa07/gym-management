'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'reset_token', { type: Sequelize.STRING, allowNull: true });
  await queryInterface.addColumn('users', 'reset_token_expiry', { type: Sequelize.DATE, allowNull: true });
  await queryInterface.changeColumn('users', 'password', { type: Sequelize.STRING, allowNull: true });

   
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'reset_token');
  await queryInterface.removeColumn('users', 'reset_token_expiry');
  await queryInterface.changeColumn('users', 'password', { type: Sequelize.STRING, allowNull: false });
  }
};

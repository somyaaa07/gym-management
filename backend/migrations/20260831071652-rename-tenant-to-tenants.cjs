'use strict';

/** @type {import('sequelize-cli').Migration */
module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.renameTable(
      'tenant',
      'tenants'
    );

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.renameTable(
      'tenants',
      'tenant'
    );

  }

};
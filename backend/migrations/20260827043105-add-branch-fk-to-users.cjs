'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('users', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_users_branch_id',
      references: {
        table: 'branches',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      'users',
      'fk_users_branch_id'
    );
  },
};
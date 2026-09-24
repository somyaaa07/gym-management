'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('member_slots', 'branch_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    // purani rows ke liye member ki branch copy kar do
    await queryInterface.sequelize.query(`
      UPDATE member_slots ms
      JOIN members m ON m.id = ms.member_id
      SET ms.branch_id = m.branch_id
      WHERE ms.branch_id IS NULL
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('member_slots', 'branch_id');
  },
};
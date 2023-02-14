module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('role_permissions', 'role_permissions_permission_id_fkey');
  },
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('role_permissions');
  },
};

module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('users', 'bay_id');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.addColumn('users', 'bay_id');
  },
};

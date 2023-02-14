module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('users', 'details', {
        type: Sequelize.DataTypes.JSONB,
      }),
    ]);
  },

  async down(queryInterface, _Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'details'),
    ]);
  },
};

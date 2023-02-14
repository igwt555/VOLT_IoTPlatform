module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('organizations', 'config', {
        type: Sequelize.DataTypes.JSON,
      }),
    ]);
  },

  async down(queryInterface, _Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('organizations', 'config'),
    ]);
  },
};

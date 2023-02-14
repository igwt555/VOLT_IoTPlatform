module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('organizations', 'manual', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  async down(queryInterface, _Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('organizations', 'manual'),
    ]);
  },
};

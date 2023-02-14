module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('organizations', 'settings', {
        type: Sequelize.JSONB,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('organizations', 'settings'),
    ]);
  },
};

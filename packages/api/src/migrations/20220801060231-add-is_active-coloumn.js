/* eslint-disable no-unused-vars */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('users', 'is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'is_active'),
    ]);
  },
};

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'access_level'),
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('users', 'access_level', {
        type: Sequelize.DataTypes.STRING
      }),
    ]);
  }
};

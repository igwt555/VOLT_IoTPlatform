'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addConstraint('access_methods', {
        fields: ['data'],
        type: 'unique',
      })
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeConstraint('access_methods', 'unique', {
        fields: ['data'],
      }),
    ]);
  }
};

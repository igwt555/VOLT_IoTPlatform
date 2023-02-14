'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('devices', 'last_connectivity_event', {
        type: 'TIMESTAMP WITH TIME ZONE USING last_connectivity_event::timestamp with time zone',
        allowNull: true,
        defaultValue: null,
      })
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('devices', 'last_connectivity_event', {
        type: Sequelize.STRING,
      }),
    ]);
  }
};

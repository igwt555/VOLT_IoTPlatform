'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('kb_device_events', 'details', {
        type: Sequelize.JSONB,
        defaultValue: null,
      }),
    ]);
  },

  async down (queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('kb_device_events', 'details'),
    ]);
  }
};

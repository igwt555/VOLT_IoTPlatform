module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_events', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      type: {
        type: Sequelize.STRING,
      },
      device_id: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.JSON,
      },
      occured_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('device_events');
  },
};

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('kb_device_events', 'access_method_id', {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'access_methods',
          },
          key: 'id',
        },
      }),
      queryInterface.sequelize.query("ALTER TYPE enum_kb_device_events_event ADD VALUE 'access_rejected'"),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('kb_device_events', 'access_method_id'),
      queryInterface.changeColumn('kb_device_events', 'event', {
        type: Sequelize.ENUM('deposit', 'retrieval'),
        allowNull: false,
      }),
    ]);
  },
};

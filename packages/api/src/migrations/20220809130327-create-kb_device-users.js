module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kb_devices_users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      kb_device_id: {
        type: Sequelize.UUID,
        references: {
          model: 'kb_devices',
          key: 'id',
        },

      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      reserved_until: {
        type: Sequelize.DATE,
      },
      alert_on_expire: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      created_by: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        default: Date.now(),
      },
      updated_at: {
        type: Sequelize.DATE,
        default: Date.now(),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kb_devices_users');
  },
};

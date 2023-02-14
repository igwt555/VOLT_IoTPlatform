module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('kb_device_events', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      event: {
        type: Sequelize.ENUM('deposit', 'retrieval'),
      },
      device_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'devices',
          },
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
      },
      kb_device_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'kb_devices',
          },
          key: 'id',
        },
      },
      chamber_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('kb_device_events');
  },
};

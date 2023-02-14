module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kb_chamber_reservations', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
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
      device_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'devices',
          },
          key: 'id',
        },
      },
      chamber_id: {
        type: Sequelize.INTEGER,
      },
      reservation_type: {
        type: Sequelize.ENUM('one-off', 'persistent'),
      },
      created_by: {
        type: Sequelize.UUID,
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
    await queryInterface.dropTable('kb_chamber_reservations');
  },
};

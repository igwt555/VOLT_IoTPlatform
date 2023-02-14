module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bays', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      bayNumber: {
        type: Sequelize.INTEGER,
      },
      checkIn: {
        type: Sequelize.DATE,
      },
      checkOut: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      unitId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'units',
          },
          key: 'id',
        },
      },
      deviceId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'devices',
          },
          key: 'id',
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('bays');
  },
};

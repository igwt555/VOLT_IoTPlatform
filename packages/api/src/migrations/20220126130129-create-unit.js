module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('units', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      unitNumber: {
        type: Sequelize.INTEGER,
      },
      initialized: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
      },
      activity: {
        type: Sequelize.INTEGER,
      },
      connection: {
        type: Sequelize.BOOLEAN,
      },
      locationId: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'locations',
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
    await queryInterface.dropTable('units');
  },
};

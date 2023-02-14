module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('access_methods', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      type: {
        type: Sequelize.ENUM('pin_code', 'rfid'),
        allowNull: false,
      },
      data: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
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
      created_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('access_methods');
  },
};

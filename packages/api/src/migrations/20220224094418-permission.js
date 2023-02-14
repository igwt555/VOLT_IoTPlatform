module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permissions', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      // foreign key->organization.id,
      organization_id: {
        allowNull: false,
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'organizations',
          },
          key: 'id',
        },
        defaultValue: null,
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
    await queryInterface.dropTable('permissions');
  },
};

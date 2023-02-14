module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      // foreign key->permission.id,
      permission_id: {
        allowNull: false,
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'permissions',
          },
          key: 'id',
        },
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
    await queryInterface.dropTable('role_permissions');
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('organizations', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      logo_filename: {
        type: Sequelize.DataTypes.STRING,
      },
      parent_org_id: {
        type: Sequelize.DataTypes.UUID,
      },
      azure_ad_secret: {
        type: Sequelize.DataTypes.STRING(5000),
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
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.dropTable('organizations');
  },
};

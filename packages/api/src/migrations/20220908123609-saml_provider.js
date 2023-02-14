module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('saml_provider', {
        id: {
          type: Sequelize.DataTypes.UUID,
          primaryKey: true,
          defaultValue: Sequelize.DataTypes.UUIDV4,
        },
        organization_id: {
            type: Sequelize.DataTypes.UUID,
        },
        name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
        }, 
        type: {
          type: Sequelize.DataTypes.STRING,
        },
        logo_filename: {
            type: Sequelize.DataTypes.STRING,
        },
        entry_point: {
          type: Sequelize.DataTypes.STRING,
        }, 
        cert: {
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
      await queryInterface.dropTable('saml_provider');
    },
  };
  
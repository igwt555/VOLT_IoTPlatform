module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("device_locations", {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      location_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: "locations",
          },
          key: "id",
        },
      },
      device_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: "devices",
          },
          key: "id",
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

  async down (queryInterface, Sequelize) {
   
    await queryInterface.dropTable("device_locations");
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("otto_inspection_reports", {
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
            tableName: "users",
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
      report: {
        type: Sequelize.JSONB,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("otto_inspection_reports");
  },
};

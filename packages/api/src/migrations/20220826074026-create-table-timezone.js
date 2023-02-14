module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('timezones', {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      value: {
        type: Sequelize.STRING,
      },
      abbr: {
        type: Sequelize.STRING,
      },
      offset: {
        type: Sequelize.STRING,
      },
      isdst: {
        type: Sequelize.BOOLEAN,
      },
      text: {
        type: Sequelize.STRING,
      },
      utc: {
        type: Sequelize.ARRAY(Sequelize.STRING),
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

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('timezones');
  },
};
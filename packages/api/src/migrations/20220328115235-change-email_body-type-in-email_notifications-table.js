module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('email_notifications', 'email_body', {
        type: Sequelize.TEXT,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('email_notifications', 'email_body', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};

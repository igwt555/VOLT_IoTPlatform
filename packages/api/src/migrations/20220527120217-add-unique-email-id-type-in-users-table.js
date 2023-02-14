module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING,
        unique: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING,
      }),
    ]);
  },
};

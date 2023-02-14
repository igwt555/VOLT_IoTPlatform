module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('organizations', 'logo_filename', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('organizations', 'logo_filename', {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },
};

module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.dropTable('units');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.createTable('units');
  },
};
module.exports = {
  async up(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('bays', 'unitId');
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.addColumn('bays', 'unitId');
  },
};
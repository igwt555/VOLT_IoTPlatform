module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('users', 'role_id', {
        type: Sequelize.DataTypes.UUID,
      }),
    ]);
  },

  async down(queryInterface, _Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'role_id'),
    ]);
  },
};

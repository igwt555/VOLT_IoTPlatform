/* eslint-disable no-unused-vars */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('users', 'phoneNo', {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn('users', 'timezoneid', {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: {
            tableName: 'timezones',
          },
          key: 'id',
        },
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('users', 'phoneNo'),
      queryInterface.removeColumn('users', 'timezone'),
    ]);
  },
};

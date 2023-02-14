/* eslint-disable no-unused-vars */
// eslint-disable-next-line strict

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn('organizations', 'favicon_filename', {
        type: Sequelize.STRING,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('organizations', 'favicon_filename'),
    ]);
  },
};

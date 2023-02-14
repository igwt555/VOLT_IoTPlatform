module.exports = {
    async up(queryInterface, Sequelize) {
      return Promise.all([
        queryInterface.addColumn('organizations', 'google_workspace_token', {
          type: Sequelize.JSON,
        }),
      ]);
    },
  
    async down(queryInterface, _Sequelize) {
      return Promise.all([
        queryInterface.removeColumn('organizations', 'google_workspace_token'),
      ]);
    },
  };
  
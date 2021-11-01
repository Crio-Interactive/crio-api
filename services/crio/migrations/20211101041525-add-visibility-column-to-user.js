module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.describeTable('Users').then(async tableDefinition => {
      if (tableDefinition.visibility) {
        return Promise.resolve();
      }
      return queryInterface.addColumn('Users', 'visibility', {
        type: Sequelize.DataTypes.JSONB,
      });
    }),

  down: async queryInterface =>
    queryInterface.describeTable('Users').then(async tableDefinition => {
      if (tableDefinition.visibility) {
        return queryInterface.removeColumn('Users', 'visibility');
      }
    }),
};

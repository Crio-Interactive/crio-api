module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.describeTable('Users').then(async tableDefinition => {
      if (tableDefinition.visibility) {
        await queryInterface.removeColumn('Users', 'visibility');
      }
      return queryInterface.addColumn('Users', 'visibility', {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING),
        defaultValue: ['name', 'username', 'email'],
      })
    }),

  down: async queryInterface =>
    queryInterface.describeTable('Users').then(async tableDefinition => {
      if (tableDefinition.visibility) {
        return queryInterface.removeColumn('Users', 'visibility');
      }
    }),
};

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.describeTable('Payments').then(async tableDefinition => {
      if (tableDefinition.subscriptionCancel) {
        return Promise.resolve();
      }
      return queryInterface.addColumn('Payments', 'subscriptionCancel', {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
      });
    }),

  down: async queryInterface =>
    queryInterface.describeTable('Payments').then(async tableDefinition => {
      if (tableDefinition.subscriptionCancel) {
        return queryInterface.removeColumn('Payments', 'subscriptionCancel');
      }
    }),
};

'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type:  Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      periodStart: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      periodEnd: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      subscriptionStatus: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastEventSnapshot: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Payments');
  }
};

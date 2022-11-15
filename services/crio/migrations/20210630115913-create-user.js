'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      providerType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      providerUserId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
      },
      avatar: {
        type: Sequelize.STRING,
      },
      about: {
        type: Sequelize.TEXT,
      },
      stripeAccountId: {
        type: Sequelize.STRING,
      },
      featuresSeen: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      helpSeen: {
        type: Sequelize.BOOLEAN,
        default: false,
      },
      showRevenue: {
        type: Sequelize.BOOLEAN,
        default: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    }),

  down: queryInterface => queryInterface.dropTable('Users'),
};

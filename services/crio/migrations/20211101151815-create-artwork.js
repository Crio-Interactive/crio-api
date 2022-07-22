'use strict';
const { ACCESSIBILITY } = require('../constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Artworks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Users',
          },
          key: 'id',
        },
        allowNull: false,
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      accessibility: {
        type: Sequelize.ENUM,
        values: Object.values(ACCESSIBILITY),
        default: ACCESSIBILITY.SUBSCRIBER_ONLY,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      pictures_uri: {
        type: Sequelize.STRING,
        allowNull: false,
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
    });
  },
  down: async queryInterface => {
    return queryInterface.dropTable('Artworks');
  },
};

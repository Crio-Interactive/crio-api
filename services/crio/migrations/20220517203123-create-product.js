'use strict';
const { ACCESSIBILITY } = require('../constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
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
      categoryId: {
        references: {
          model: {
            tableName: 'Categories',
          },
          key: 'id',
        },
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      limit: {
        type: Sequelize.SMALLINT,
      },
      accessibility: {
        type: Sequelize.ENUM,
        values: Object.values(ACCESSIBILITY),
        default: ACCESSIBILITY.SUBSCRIBER_ONLY,
      },
      thumbnail: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable('Products');
  },
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Followings', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: {
          tableName: 'Users',
        },
        key: 'id'
      },
      allowNull: false,
    },
    followingId: {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'Users',
        },
        key: 'id'
      },
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    deletedAt: {
      allowNull: true,
      type: Sequelize.DATE,
    },
  }),

  down: queryInterface => queryInterface.dropTable('Followings'),
};
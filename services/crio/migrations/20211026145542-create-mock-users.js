'use strict';

const { v4: uuidv4 } = require('uuid');
const models = require('../models');

const mockUsers = [
  {
    firstName: 'Will',
    lastName: 'Young',
    username: 'willy',
    email: 'will.y@gmail.com',
  },
  {
    firstName: 'Lisa',
    lastName: 'West',
    username: 'curly_artist',
    email: 'lisa.west@gmail.com',
  },
  {
    firstName: 'Ji',
    lastName: 'Yeon',
    username: 'ji-yeon',
    email: 'ji.yeon@gmail.com',
  },
  {
    firstName: 'Joe',
    lastName: 'Smith',
    username: 'joe',
    email: 'smith@gmail.com',
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.STRING,
        unique: true,
      },
      fbUserId: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
      },
      lastName: {
        type: Sequelize.STRING,
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
    });
    await models.User.bulkCreate(mockUsers.map(item => ({
      ...item,
      userId: uuidv4(),
    })));
    return models.Creator.bulkCreate(mockUsers.map(({ email }) => ({ email })));
  },

  down: async () => {
    const emails = mockUsers.map(({ email }) => email);
    await models.User.destroy({ where: { email: emails }});
    return models.Creator.destroy({ where: { email: emails }});
  },
};
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Users', {
      fields: ['email'],
      type: 'unique',
      name: 'Users_email_unique'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Users', 'Users_email_unique');
  }
};

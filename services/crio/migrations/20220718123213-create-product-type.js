'use strict';

const types = [
  'Digital Product',
  'Service',
  // 'eBooks',
  // 'Comics',
  // 'Artworks',
  // 'Art Tools & Assets',
  // 'Game Assets',
  // 'Software',
  // 'Photos',
  // 'Videw',
  // 'Guids/ Documents',
  // 'Templates',
];
const values = types.map(item => `('${item}',now(),now())`).join(',');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ProductTypes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
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

    return queryInterface.sequelize.query(`
      INSERT INTO "ProductTypes" (name, "createdAt", "updatedAt")
      VALUES ${values}
    `);
  },
  down: async queryInterface => {
    return queryInterface.dropTable('ProductTypes');
  },
};

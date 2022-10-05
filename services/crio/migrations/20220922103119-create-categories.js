'use strict';
const { TYPES } = require('../constants');

const mainCategories = ['Digital Product', 'Commissions'];

const productCategories = [
  'Animation Assets',
  'Artworks & Wallpapers',
  'Books & Comics',
  'Brushes',
  'Game Assets',
  'Graphics & Design',
  'Guides & Templates',
  'Tutorials & Courses',
  '3D Assets',
];

const contentCategories = [
  'Animation',
  'Anime & Manga',
  'Artificial Intelligence',
  'Character Art',
  'Concept Art',
  'Game Art',
  'Graphic Design',
  'Illustration',
  'Photography',
  'Pixel',
  'Podcasts',
  'Portrait',
  'Science Fiction',
  'VFX',
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Categories', {
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
      type: {
        type: Sequelize.ENUM,
        values: Object.values(TYPES),
      },
      mainCategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Categories',
          },
          key: 'id',
        },
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

    const mainCategoriesValues = mainCategories
      .map(item => `('${item}', '${TYPES.PRODUCT}', now(), now())`)
      .join(',');
    await queryInterface.sequelize.query(`
      INSERT INTO "Categories" (name, type, "createdAt", "updatedAt")
      VALUES ${mainCategoriesValues}
    `);

    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Categories" WHERE name = 'Digital Product'`,
    );
    const mainCategoryId = categories[0]?.id;
    const productCategoriesValues = productCategories
      .map(item => `('${item}', '${TYPES.PRODUCT}', ${mainCategoryId}, now(), now())`)
      .join(',');
    await queryInterface.sequelize.query(`
      INSERT INTO "Categories" (name, type, "mainCategoryId", "createdAt", "updatedAt")
      VALUES ${productCategoriesValues}
    `);

    const contentCategoriesValues = contentCategories
      .map(item => `('${item}', '${TYPES.CONTENT}', now(), now())`)
      .join(',');
    return queryInterface.sequelize.query(`
      INSERT INTO "Categories" (name, type, "createdAt", "updatedAt")
      VALUES ${contentCategoriesValues}
    `);
  },
  down: async queryInterface => {
    return queryInterface.dropTable('Categories');
  },
};

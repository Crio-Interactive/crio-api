'use strict';

module.exports = {
  up: queryInterface =>
    queryInterface.sequelize.query(`
    CREATE VIEW "RandomProducts" AS
    SELECT
      row_number() OVER () AS id,
      "Products"."id" AS "productId",
      "Products"."userId",
      "username",
      "providerType",
      "providerUserId",
      "avatar",
      "categoryId",
      "title",
      "description",
      "price",
      "limit",
      "accessibility",
      "thumbnails",
      "file",
      count("ProductLikes"."productId") AS likes
    FROM "Users"
      INNER JOIN "Products" ON "Users".id = "Products"."userId"
      LEFT JOIN "ProductLikes" ON "Products".id = "ProductLikes"."productId"
    WHERE "Users"."deletedAt" IS NULL AND "Products"."deletedAt" IS NULL AND "ProductLikes"."deletedAt" IS NULL
    GROUP BY
      "Products"."id",
      "Products"."userId",
      "username",
      "providerType",
      "providerUserId",
      "avatar",
      "categoryId",
      "title",
      "description",
      "price",
      "limit",
      "accessibility",
      "thumbnails",
      "file",
      "ProductLikes"."productId"
  `),

  down: queryInterface => queryInterface.sequelize.query('DROP VIEW IF EXISTS "RandomProducts"'),
};

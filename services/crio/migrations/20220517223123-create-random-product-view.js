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
      "type",
      "title",
      "description",
      "price",
      "limit",
      "accessibility",
      "thumbnail"
      FROM "Users" INNER JOIN "Products" ON "Users".id = "Products"."userId"
    WHERE "Users"."deletedAt" IS NULL AND "Products"."deletedAt" IS NULL
  `),

  down: queryInterface => queryInterface.sequelize.query('DROP VIEW IF EXISTS "RandomProducts"'),
};

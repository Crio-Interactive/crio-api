'use strict';

module.exports = {
  up: queryInterface =>
    queryInterface.sequelize.query(`
    CREATE VIEW "RandomArtworks" AS
    SELECT
      row_number() OVER () AS id,
      "Artworks"."id" AS "artworkId",
      "Artworks"."userId",
      "providerType",
      "providerUserId",
      "username" AS "name",
      "firstName",
      "lastName",
      "username",
      "email",
      "avatar",
      "visibility",
      "videoUri",
      "thumbnailUri",
      "title",
      "description",
      "Artworks"."accessibility"
    FROM "Users" INNER JOIN "Artworks" ON "Users".id = "Artworks"."userId"
    WHERE status='available' AND "Users"."deletedAt" IS NULL AND "Artworks"."deletedAt" IS NULL
  `),

  down: queryInterface => queryInterface.sequelize.query('DROP VIEW IF EXISTS "RandomArtworks"'),
};

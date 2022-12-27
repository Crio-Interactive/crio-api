'use strict';

module.exports = {
  up: queryInterface =>
    queryInterface.sequelize.query(`
    CREATE VIEW "RandomArtworks" AS
    SELECT
      row_number() OVER () AS id,
      "Artworks"."id" AS "artworkId",
      "Artworks"."userId",
      "username",
      "image",
      "categoryId",
      "content",
      "thumbnail",
      "title",
      "description",
      "Artworks"."accessibility",
      count("ArtworkLikes"."artworkId") AS likes
    FROM "Users"
      INNER JOIN "Artworks" ON "Users".id = "Artworks"."userId"
      LEFT JOIN "ArtworkLikes" ON "Artworks".id = "ArtworkLikes"."artworkId"
    WHERE status='available' AND "Users"."deletedAt" IS NULL AND "Artworks"."deletedAt" IS NULL AND "ArtworkLikes"."deletedAt" IS NULL
    GROUP BY
      "Artworks"."id",
      "Artworks"."userId",
      "username",
      "image",
      "categoryId",
      "content",
      "thumbnail",
      "title",
      "description",
      "Artworks"."accessibility",
      "ArtworkLikes"."artworkId"
  `),

  down: queryInterface => queryInterface.sequelize.query('DROP VIEW IF EXISTS "RandomArtworks"'),
};

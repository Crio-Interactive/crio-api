'use strict';

module.exports = {
  up: (queryInterface) => queryInterface.sequelize.query(`
  CREATE VIEW "RandomArtworks" AS
  SELECT
         row_number() OVER () AS id,
         CASE WHEN 'name'= ANY("visibility") THEN CONCAT("firstName", ' ', "lastName")
              WHEN 'username'= ANY("visibility") THEN "username"
              ELSE "Users"."email" END
         AS name,
         "Artworks"."userId",
         "fbUserId",
         "videoUri",
         "thumbnailUri",
         "title",
         "description"
  FROM "Users"
      INNER JOIN "Creators" ON "Users".email = "Creators"."email"
      INNER JOIN "Artworks" ON "Users".id = "Artworks"."userId"
  WHERE status='available'

  `),

  down: queryInterface => queryInterface.sequelize.query('DROP VIEW IF EXISTS "RandomArtworks"'),
};

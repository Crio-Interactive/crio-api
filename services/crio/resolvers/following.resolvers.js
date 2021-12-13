module.exports = {
  Query: {
    getFollowings: async (_, {}, { user, loaders, models }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      const [followings] = await models.sequelize.query(`
        SELECT "RandomArtworks".*
        FROM "Followings" INNER JOIN "RandomArtworks"
          ON "Followings"."followingId" = "RandomArtworks"."userId"
          AND "Followings"."deletedAt" IS NULL
        WHERE "Followings"."userId" = ${id}
          AND (
            SELECT count(*)
            FROM "RandomArtworks" AS "Works"
            WHERE "Works"."id" <= "RandomArtworks".id AND "Works"."userId" = "RandomArtworks"."userId"
          ) <= 12
        ORDER BY "Followings"."followingId"
      `);

      return followings.reduce((acc, current) => {
        const artwork = {
          videoUri: current.videoUri,
          thumbnailUri: current.thumbnailUri,
          title: current.title,
          description: current.description,
        };
        if (acc.some(({ userId }) => userId === current.userId)) {
          const item = acc.find(({ userId }) => userId === current.userId);
          item.artworks.push(artwork);
          return acc;
        }
        return [
          ...acc,
          {
            id: current.id,
            userId: current.userId,
            providerType: current.providerType,
            providerUserId: current.providerUserId,
            name: current.name,
            email: current.email,
            firstName: current.firstName,
            lastName: current.lastName,
            username: current.username,
            visibility: current.visibility,
            artworks: [artwork],
          }
        ];
      }, []);
    },
    isFollowing: async (_, { followingId }, { loaders }) => loaders.isFollowing.load(followingId),
  },
  Mutation: {
    createFollowing: async (_, { followingId }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const isFollowing = await loaders.isFollowing.load(followingId);
        if (isFollowing) {
          await models.Following.destroy({ where: { userId: id, followingId } });
        } else {
          await models.Following.create({ userId: id, followingId });
        }
        return true;
      } catch (e) {
        return e;
      }
    },
  },
};

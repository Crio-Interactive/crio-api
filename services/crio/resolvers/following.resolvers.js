module.exports = {
  Query: {
    getFollowings: async (_, { username }, { user, loaders, models }) => {
      let userId;
      if (username) {
        const { id } = await loaders.userByUsername.load(username);
        userId = id;
      } else {
        const { id: loggedInUserId } = await loaders.userByUserId.load(user.attributes.sub);
        userId = loggedInUserId;
      }
      const [followings] = await models.sequelize.query(`
        SELECT "RandomArtworks".*
        FROM "Followings" INNER JOIN "RandomArtworks"
          ON "Followings"."followingId" = "RandomArtworks"."userId"
          AND "Followings"."deletedAt" IS NULL
        WHERE "Followings"."userId" = ${userId}
          AND (
            SELECT count(*)
            FROM "RandomArtworks" AS "Works"
            WHERE "Works"."id" <= "RandomArtworks".id AND "Works"."userId" = "RandomArtworks"."userId"
          ) <= 12
        ORDER BY "Followings"."followingId"
      `);

      return followings.reduce((acc, current) => {
        const artwork = {
          artworkId: current.id,
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
            avatar: current.avatar,
            artworks: [artwork],
          },
        ];
      }, []);
    },
    getFollowersCount: async (_, {}, { user, loaders, models }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      return models.Following.count({ where: { followingId: id } });
    },
    isFollowing: async (_, { followingUsername }, { loaders }) => {
      const { id } = await loaders.userByUsername.load(followingUsername);
      return loaders.isFollowing.load(id);
    },
  },
  Mutation: {
    createFollowing: async (_, { followingUsername }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const { id: followingId } = await loaders.userByUsername.load(followingUsername);
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

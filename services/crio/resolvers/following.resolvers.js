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
      return models.Following.findAll({
        raw: true,
        attributes: [
          'id',
          'followingId',
          'User.username',
          'User.firstName',
          'User.lastName',
          'User.image',
        ],
        include: {
          attributes: [],
          model: models.User,
          required: true,
        },
        where: { userId },
      });
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

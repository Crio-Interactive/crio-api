module.exports = {
  Query: {
    getFollowings: async (_, {}, { user, loaders, models }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      return models.Following.findAll({
        raw: true,
        attributes: [
          'User.id',
          'userId',
          'User.fbUserId',
          'User.email',
          'User.firstName',
          'User.lastName',
          'User.username',
          'User.visibility',
        ],
        include: {
          attributes: [],
          model: models.User,
        },
        where: { userId: id },
      });
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

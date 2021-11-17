module.exports = {
  Query: {
    isSubscriber: async (_, { subscriberId }, { loaders }) => loaders.isSubscriber.load(subscriberId),
  },
  Mutation: {
    createSubscriber: async (_, { subscriberId }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const isSubscriber = await loaders.isSubscriber.load(subscriberId);
        if (!isSubscriber) {
          await models.Subscriber.create({ userId: id, subscriberId });
          return true;
        }
        return false;
      } catch (e) {
        return e;
      }
    },
  },
};

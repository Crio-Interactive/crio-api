module.exports = {
  UserInfo: {
    isCreator: async (parent, {}, { loaders }) => loaders.isCreator.load(parent.email),
    vouchers: async (parent, {}, { models }) => models.Voucher.findOne({ where: { userId: parent.id }}),
    payment: async (parent, {}, { models }) => models.Payment.findOne({ where: { userId: parent.id }}),
  },
  Query: {
    me: async (_, {}, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUser: async (_, { id }, { loaders }) => loaders.userById.load(id),
    getCreatorUsers: async (_, {}, { models }) => {
      const creators = await models.Creator.findAll({ attributes: ['email'] });
      return models.User.findAll({
        where: { email: creators.map(({ dataValues }) => dataValues.email) },
      });
    },
  },
  Mutation: {
    saveUser: async (_, {}, { user, models }) => {
      try {
        const attr = user.attributes;
        const existingUser = await models.User.findOne({ where: { userId: attr.sub } });
        if (!existingUser) {
          return models.User.create({
            userId: attr.sub,
            fbUserId: user.username.substring(user.username.indexOf('_') + 1),
            email: attr.email,
            username: `${attr.given_name}_${attr.family_name}`,
            firstName: attr.given_name,
            lastName: attr.family_name,
          });
        }
        return existingUser;
      } catch (e) {
        return e;
      }
    },
    updateUser: async (_, { attributes }, { user, models }) => {
      try {
        const [, updatedUser] = await models.User.update(attributes, {
          where: { userId: user.attributes.sub },
          returning: true,
        });
        return updatedUser?.[0].dataValues;
      } catch (e) {
        return e;
      }
    },
  },
};

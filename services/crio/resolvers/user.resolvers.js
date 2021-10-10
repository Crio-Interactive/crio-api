const moment = require('moment');

module.exports = {
  Query: {
    me: async (_, params, { user }) => user,
    getUser: async (_, { id }, { loaders }) => loaders.userById.load(id),
  },
  Mutation: {
    saveUser: async (_, { attributes }, { models }) => {
      try {
        const user = await models.User.findOne({ where: { userId: attributes.userId} });
        if (!user) {
          return models.User.create(attributes);
        }
        return user;
      } catch (e) {
        return e;
      }
    },
    updateUser: async (_, { attributes }, { user, models }) => {
      try {
        if (attributes.age) {
          attributes.dob = moment().subtract(attributes.age, 'years');
        }
        return user.update(attributes);
      } catch (e) {
        return e;
      }
    },
  },
};

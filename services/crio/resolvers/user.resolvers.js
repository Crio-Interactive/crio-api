const moment = require('moment');

module.exports = {
  Query: {
    me: async (_, params, { user }) => user,
    getUser: async (_, { id }, { loaders }) => loaders.userById.load(id),
  },
  Mutation: {
    saveUser: async (_, { username }, { models }) => {
      try {
        return models.User.create({ username });
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

const moment = require('moment');

module.exports = {
  Query: {
    me: async (_, params, { user }) => user,
    getUser: async (_, { id }, { loaders }) => loaders.userById.load(id),
  },
  Mutation: {
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

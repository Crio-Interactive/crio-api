const moment = require('moment');

module.exports = {
  UserInfo: {
    creator: async (parent, {}, { loaders }) => console.log(parent, 'parent') || loaders.isCreator.load(parent.email),
  },
  Query: {
    me: async (_, params, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUser: async (_, { id }, { loaders }) => loaders.userById.load(id),
  },
  Mutation: {
    saveUser: async (_, {}, { user, models }) => {
      try {
        const attr = user.attributes;
        const existingUser = await models.User.findOne({ where: { userId: attr.sub} });
        if (!existingUser) {
          return models.User.create({
            userId: attr.sub,
            email: attr.email,
            username: attr.sub,
            firstName: attr.family_name,
            lastName: attr.given_name,
          });
        }
        return existingUser;
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

const { vimeoClient } = require('../config/httpClient');

module.exports = {
  UserInfo: {
    creator: async (parent, {}, { loaders }) => loaders.isCreator.load(parent.userId),
  },
  Query: {
    me: async (_, params, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUploadUrl: async (_, { size }) => {
      const result = await vimeoClient.post('/', {
        upload: {
          approach: 'tus',
          size,
        },
      });
      return result.data.upload.upload_link;
    },
  },
  Mutation: {},
};

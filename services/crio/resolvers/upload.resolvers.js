const axios = require('axios');
const { vimeoClient } = require('../config/httpClient');

module.exports = {
  Query: {
    getUploadUrl: async (_, { size }) => {
      try {
        const result = await vimeoClient.post('/me/videos', {
          upload: {
            approach: 'tus',
            size,
          },
        });
        return {
          uri: result.data.uri,
          upload_link: result.data.upload.upload_link,
          status: result.data.status,
          pictures_uri: result.data.metadata.connections.pictures.uri,
        };
      } catch (e) {
        return e;
      }
    },
  },
  Mutation: {
    updateThumbnail: async (_, params, { user, loaders, models }) => {
      try {
        const artwork = await loaders.artworkById.load(params.artworkId);
        const { data: { uri, link } } = await vimeoClient.post(artwork.pictures_uri);
        const imageFile = new Buffer(params.image);
        const { data: { status } } = await axios.put(link, imageFile, {
          headers: {
            'Content-Type': params.mime,
          }
        });
        if (status === 'success') {
          await vimeoClient.patch(uri, { active: true });
          const videoData = await vimeoClient.get(artwork.videoUri);
          await models.Artwork.update({ thumbnailUri: videoData.data.pictures.base_link});
          return true;
        }
      } catch (e) {
        return false;
      }
    },
  },
};

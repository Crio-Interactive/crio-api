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
    updateMetadata: async (_, params, { loaders, models }) => {
      try {
        const { artworkId, name, description, image, mime } = params;
        const artwork = await loaders.artworkById.load(artworkId);
        // update name and description
        const result = vimeoClient.patch(artwork.videoUri, {
          name,
          description,
        });
        // update the thumbnail
        const { data: { uri, link } } = await vimeoClient.post(artwork.pictures_uri);
        const imageFile = new Buffer(image);
        const { data: { status } } = await axios.put(link, imageFile, {
          headers: {
            'Content-Type': mime,
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

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
    getUploadImageLink: async (_, { artworkId }, { loaders }) => {
      try {
        const { pictures_uri } = await loaders.artworkById.load(artworkId);
        const {
          data: { uri, link },
        } = await vimeoClient.post(pictures_uri);

        return { uri, link };
      } catch (e) {
        return e;
      }
    },
  },
  Mutation: {
    updateMetadata: async (_, { params }, { loaders }) => {
      try {
        const { artworkId, title, description, uri } = params;
        const artwork = await loaders.artworkById.load(artworkId);
        if (title && description) {
          await vimeoClient.patch(artwork.videoUri, { name: title, description });
          await artwork.update({ title, description });
          return true;
        }
        if (uri) {
          await vimeoClient.patch(uri, { active: true });
          const videoData = await vimeoClient.get(
            `${artwork.videoUri}/pictures?fields=base_link,active`,
          );
          await artwork.update({
            thumbnailUri: videoData.data.data.find(({ active }) => active === true)?.base_link,
          });
          return true;
        }
        return false;
      } catch (e) {
        return e;
      }
    },
  },
};

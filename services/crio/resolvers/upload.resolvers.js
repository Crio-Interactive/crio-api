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
    updateMetadata: async (_, { params }, { user, loaders, models }) => {
      try {
        const { artworkId, title, description, accessibility, uri, thumbnail } = params;
        const artwork = await loaders.artworkById.load(artworkId);
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        if (artwork.userId !== id) {
          throw new Error('An artwork does not belong to you');
        }
        if (thumbnail || (title && description)) {
          if (
            artwork.content.startsWith('/videos/') &&
            (title !== artwork.title || description !== artwork.description)
          ) {
            await vimeoClient.patch(artwork.content, { name: title, description });
          }
          await models.Artwork.update(
            { title, description, accessibility, thumbnail },
            { where: { id: artworkId } },
          );
          return true;
        }
        if (uri) {
          await vimeoClient.patch(uri, { active: true });
          const videoData = await vimeoClient.get(
            `${artwork.content}/pictures?fields=base_link,active`,
          );
          await models.Artwork.update(
            { thumbnail: videoData.data.data.find(({ active }) => active === true)?.base_link },
            { where: { id: artworkId } },
          );
          return true;
        }
        return false;
      } catch (e) {
        return e;
      }
    },
  },
};

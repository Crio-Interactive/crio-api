const { vimeoClient } = require('../config/httpClient');
module.exports = {
  Query: {
    getArtworks: async () => {},
  },
  Mutation: {
    createArtwork: async (_, { videoUri }, {
      user,
      models,
    }) => {
      try {

        const videoData = await vimeoClient.get(videoUri);
        return models.Artwork.create({
          userId: user.id,
          videoUri,
          thumbnailUri: videoData.data.pictures.base_link,
          title: videoData.data.name,
          description: 'No description',
          status: videoData.data.status,
          pictures_uri: videoData.data.meta.connections.pictures.uri,
        });
      } catch (e) {
        return false;
      }
    },
    deleteArtwork: async (_, params, { models }) => {
      try {
        const artwork = await models.Artwork.findByPk(params.artworkId);
        await vimeoClient.delete(artwork.videoUri);
        await artwork.destroy();
        return true;
      } catch(e) {
        return false;
      }
    },
  },
};

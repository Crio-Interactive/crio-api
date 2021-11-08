const { vimeoClient } = require('../config/httpClient');
module.exports = {
  Query: {
    getArtworks: async (_, {}, { user, loaders, models }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      return models.Artwork.findAll({
        raw: true,
        where: { userId: id },
      });
    },
  },
  Mutation: {
    createArtwork: async (_, { videoUri }, { user, loaders, models }) => {
      try {
        const videoData = await vimeoClient.get(videoUri);
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        return models.Artwork.create({
          userId: id,
          videoUri,
          thumbnailUri: videoData?.data?.pictures?.base_link,
          title: videoData?.data?.name,
          description: 'No description',
          status: videoData?.data?.status,
          pictures_uri: videoData?.data?.metadata?.connections?.pictures?.uri,
        });
      } catch (e) {
        return false;
      }
    },
    deleteArtwork: async (_, { artworkId }, { models }) => {
      try {
        const artwork = await models.Artwork.findByPk(artworkId);
        await vimeoClient.delete(artwork.videoUri);
        await artwork.destroy();
        return true;
      } catch(e) {
        return false;
      }
    },
  },
};

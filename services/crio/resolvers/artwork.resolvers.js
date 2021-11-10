const BlueBird = require('bluebird');
const { vimeoClient } = require('../config/httpClient');

module.exports = {
  Query: {
    getArtworks: async () => {},
    getUserArtworks: async (_, { id }, { user, loaders }) => {
      let userId = id;
      if (!id) {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        userId = id;
      }
      return loaders.artworksByUserId.load(userId);
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
    updateArtworks: async (_, {}, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const artworks = await models.Artwork.findAll({
          raw: true,
          include: {
            attributes: [],
            model: models.User,
          },
          where: {
            userId: id,
            status: ['uploading', 'transcode_starting', 'transcoding'],
          },
        });
        await BlueBird.each(artworks, async item => {
          try {
            const { data } = await vimeoClient.get(item.videoUri);
            if (item.status !== data.status || item.thumbnailUri !== data.pictures.base_link) {
              await models.Artwork.update({ status: data.status, thumbnailUri: data.pictures.base_link }, {
                where: { id: item.id },
              });
            }
          } catch (e) {
            return;
          }
        }, { concurrency: 5 });
        return true;
      } catch(e) {
        return false;
      }
    },
    deleteArtwork: async (_, { params: { artworkId, videoUri } }, { loaders }) => {
      try {
        let uri = videoUri;
        if (artworkId) {
          const artwork = await loaders.artworkById.load(artworkId);
          uri = artwork.videoUri;
          await artwork.destroy();
        }
        if (uri) {
          await vimeoClient.delete(uri);
        }
        return true;
      } catch(e) {
        return false;
      }
    },
  },
};

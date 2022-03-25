const BlueBird = require('bluebird');
const { vimeoClient } = require('../config/httpClient');

module.exports = {
  Query: {
    getArtwork: async (_, { artworkId }, { loaders }) => loaders.artworkById.load(artworkId),
    getUserArtworks: async (_, { username }, { user, loaders }) => {
      let userId;
      if (username) {
        const user = await loaders.userByUsername.load(username);
        userId = user?.id;
      }
      if (!userId) {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        userId = id;
      }
      return loaders.artworksByUserId.load(userId);
    },
    getRandomArtworksInfo: async (_, {}, { user, models }) => {
      const count = await models.RandomArtwork.count();
      let creatorIds = [];
      let artworks = [];
      if (user) {
        creatorIds = (
          await models.RandomArtwork.findAll({
            raw: true,
            attributes: ['userId'],
            group: ['userId'],
            order: [models.sequelize.literal('Random()')],
          })
        ).map(({ userId }) => userId);
        [artworks] = await models.sequelize.query(`
          SELECT  *
          FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY Random()) AS RowNumber
                  FROM "RandomArtworks") AS artworks
          WHERE artworks.RowNumber = 1
          ORDER BY Random()
          LIMIT 4
        `);
      }
      return { count, creatorIds, artworks };
    },
    getRandomArtworks: async (
      _,
      { params: { count, userId, artworkId, limit = 15, offset = 0 } },
      { models },
    ) =>
      models.RandomArtwork.findAll({
        ...(userId
          ? { where: { userId, artworkId: { [models.sequelize.Sequelize.Op.ne]: artworkId } } }
          : {}),
        order: [models.sequelize.literal(count ? `id % ${count}` : 'Random()')],
        limit,
        offset,
      }),
    getRandomArtworksForFeed: async (
      _,
      { params: { count, userId, offset = 0, limit = 15 } },
      { models },
    ) => {
      const artworks = await models.RandomArtwork.findAll({
        raw: true,
        order: [models.sequelize.literal(`id % ${count}`)],
        limit,
        offset,
      });
      const userArtworks = await models.RandomArtwork.findAll({
        where: { userId },
        order: [models.sequelize.literal('Random()')],
        limit: 16,
      });

      return {
        topArtworks: offset ? undefined : artworks.slice(0, 8),
        userArtworks,
        artworks: offset ? artworks : artworks.length < 8 + 15 ? undefined : artworks.slice(8),
      };
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
        console.log(e);
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
      } catch (e) {
        return false;
      }
    },
  },
};

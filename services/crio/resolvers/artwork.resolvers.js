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
    getRandomArtworksInfo: async (_, {}, { user, models }) => {
      const count = await models.RandomArtwork.count();
      let creatorIds = [];
      let artworks = [];
      if (user) {
        creatorIds = (await models.RandomArtwork.findAll({
          raw: true,
          attributes: ['userId'],
          group: ['userId'],
          order: [models.sequelize.literal('Random()')],
        })).map(({ userId }) => userId);
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
    getRandomArtworks: async (_, { params: { count, userId, artworkId, limit = 15, offset = 0 } }, { models }) => models.RandomArtwork.findAll({
      ...(userId ? { where: { userId, artworkId: { [models.sequelize.Sequelize.Op.ne]: artworkId } } } : {}),
      order: [models.sequelize.literal(count ? `id % ${count}` : 'Random()')],
      limit,
      offset,
    }),
    getRandomArtworksForFeed: async (_, { params: { count, userId, offset = 0, limit = 15 } }, { models }) => {
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
    }
  },
  Mutation: {
    createArtwork: async (_, { videoId }, { user, loaders, models }) => {
      try {
        const videoData = await vimeoClient.get(`/videos/${videoId}`);
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        return models.Artwork.create({
          userId: id,
          videoId,
          title: videoData?.data?.name,
          description: 'No description',
          status: videoData?.data?.status,
        });
      } catch (e) {
        console.log(e);
        return false;
      }
    },
    deleteArtwork: async (_, { params: { artworkId, videoId } }, { loaders }) => {
      try {
        let id = videoId;
        if (artworkId) {
          const artwork = await loaders.artworkById.load(artworkId);
          id = artwork.videoId;
          await artwork.destroy();
        }
        if (id) {
          await vimeoClient.delete(`/videos/${id}`);
        }
        return true;
      } catch (e) {
        return false;
      }
    },
  },
};

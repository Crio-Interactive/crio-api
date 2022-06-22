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
    getRandomInfo: async (_, { keyword }, { models }) => {
      const condition = keyword
        ? {
            where: {
              [models.sequelize.Sequelize.Op.or]: [
                {
                  username: {
                    [models.sequelize.Sequelize.Op.iLike]: `%${keyword}%`,
                  },
                },
                {
                  title: {
                    [models.sequelize.Sequelize.Op.iLike]: `%${keyword}%`,
                  },
                },
              ],
            },
          }
        : {};
      const productsCount = await models.RandomProduct.count(condition);
      const artworksCount = await models.RandomArtwork.count(condition);
      const [artworks] = await models.sequelize.query(`
        SELECT  *
        FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY Random()) AS RowNumber
                FROM "RandomArtworks") AS artworks
        WHERE artworks.RowNumber = 1
        ORDER BY Random()
        LIMIT 4
      `);
      return { productsCount, artworksCount, artworks };
    },
    getRandomArtworks: async (
      _,
      { params: { count, userId, artworkId, limit = 24, offset = 0, keyword } },
      { models },
    ) => {
      let condition = {};
      if (userId) {
        condition = {
          where: { userId, artworkId: { [models.sequelize.Sequelize.Op.ne]: artworkId } },
        };
      } else if (keyword) {
        condition = {
          where: {
            [models.sequelize.Sequelize.Op.or]: [
              {
                username: {
                  [models.sequelize.Sequelize.Op.iLike]: `%${keyword}%`,
                },
              },
              {
                title: {
                  [models.sequelize.Sequelize.Op.iLike]: `%${keyword}%`,
                },
              },
            ],
          },
        };
      }
      return models.RandomArtwork.findAll({
        ...condition,
        order: [models.sequelize.literal(count ? `id % ${count}` : 'Random()')],
        limit,
        offset,
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
        return e;
      }
    },
    deleteArtwork: async (_, { params: { artworkId, videoUri } }, { loaders, models }) => {
      try {
        let uri = videoUri;
        if (artworkId) {
          const artwork = await loaders.artworkById.load(artworkId);
          uri = artwork.videoUri;
          await models.Artwork.destroy({ where: { id: artworkId } });
        }
        if (uri) {
          await vimeoClient.delete(uri);
        }
        return true;
      } catch (e) {
        return e;
      }
    },
  },
};

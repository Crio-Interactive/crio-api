const { vimeoClient } = require('../config/httpClient');

module.exports = {
  Query: {
    getArtwork: async (_, { artworkId }, { loaders }) => loaders.artworkById.load(artworkId),
    getUserArtworks: async (_, { params: { username } }, { user, loaders }) => {
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
    getRandomArtworks: async (
      _,
      { params: { limit = 24, offset = 0, keyword, categoryId } },
      { models },
    ) => {
      let where = {};
      if (keyword) {
        where = {
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
        };
      }
      if (categoryId) {
        where = { ...where, categoryId };
      }
      return models.RandomArtwork.findAll({
        where,
        order: [['artworkId', 'DESC']],
        limit,
        offset,
      });
    },
    getArtworkLikes: async (_, { artworkId }, { loaders }) =>
      loaders.artworkLikesById.load(artworkId),
  },
  Mutation: {
    createArtwork: async (_, { params }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const attributes = {
          userId: id,
          content: params.content,
          thumbnail: params.thumbnail || '',
          title: params.title,
          description: params.description || 'No description',
          status: 'available',
          accessibility: params.accessibility,
          pictures_uri: '',
          categoryId: params.categoryId,
        };
        if (params.isVideo) {
          const videoData = await vimeoClient.get(params.content);
          attributes.title = videoData?.data?.name;
          attributes.status = videoData?.data?.status;
          attributes.thumbnail = videoData?.data?.pictures?.base_link;
          attributes.pictures_uri = videoData?.data?.metadata?.connections?.pictures?.uri;
        }
        const { id: artworkId } = await models.Artwork.create(attributes);
        return { id: artworkId };
      } catch (e) {
        return e;
      }
    },
    deleteArtwork: async (_, { params: { artworkId, content } }, { loaders, models }) => {
      try {
        let uri = content;
        if (artworkId) {
          const artwork = await loaders.artworkById.load(artworkId);
          uri = artwork.content;
          await models.Artwork.destroy({ where: { id: artworkId } });
        }
        if (uri?.startsWith('/videos/')) {
          await vimeoClient.delete(uri);
        }
        return true;
      } catch (e) {
        return e;
      }
    },
    likeArtwork: async (_, { artworkId }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const like = await models.ArtworkLike.findOne({
          raw: true,
          attributes: ['userId'],
          where: {
            artworkId,
            userId: id,
          },
        });

        if (!like) {
          await models.ArtworkLike.create({
            artworkId,
            userId: id,
          });
        } else {
          await models.ArtworkLike.destroy({
            where: {
              artworkId,
              userId: id,
            },
          });
        }
        return models.ArtworkLike.count({ where: { artworkId } });
      } catch (e) {
        return e;
      }
    },
  },
};

module.exports = {
  Query: {
    getArtworks: async () => {},
  },
  Mutation: {
    createArtwork: async (_, params, {
      user,
      models,
    }) => {
      try {
        const {
          videoUri,
          thumbnailUri,
          title,
          description,
          status,
          pictures_uri,
        } = params;
        return models.Artwork.create({
          userId: user.id,
          videoUri,
          thumbnailUri,
          title,
          description,
          status,
          pictures_uri,
        });
      } catch (e) {
        return false;
      }
    },
    deleteArtwork: async (_, params, { models }) => {
      try {
        return Boolean(await models.Artwork.destroy({
          where: { id: params.artworkId },
        }));
      } catch(e) {
        return false;
      }
    },
  },
};

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
        console.log(process.env.VIMEO_ACCESS_TOKEN, 'VIMEO_ACCESS_TOKEN')

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
        const { data: { link } } = await vimeoClient.post(pictures_uri);

        return link;
      } catch (e) {
        return e;
      }
    },
  },
  Mutation: {
    updateMetadata: async (_, { params }, { loaders }) => {
      try {
        const { artworkId, title, description, image, mime } = params;
        const artwork = await loaders.artworkById.load(artworkId);
        if (title && description) {
          await vimeoClient.patch(artwork.videoUri, { name: title, description });
          await artwork.update({ title, description });
          return true;
        }
        const videoData = await vimeoClient.get(artwork.videoUri);
        await artwork.update({ status: videoData.data.status, thumbnailUri: videoData.data.pictures.base_link});
        return true;
        // if (image && mime) {
        //   const { data: { uri, link } } = await vimeoClient.post(artwork.pictures_uri);
        //   const imageFile = new Buffer.from(image);
        //   const { data: { status } } = await axios.put(link, imageFile, { headers: { 'Content-Type': mime } });
        //   if (status === 'success') {
        //     await vimeoClient.patch(uri, { active: true });
        //     const videoData = await vimeoClient.get(artwork.videoUri);
        //     await models.Artwork.update({ thumbnailUri: videoData.data.pictures.base_link});
        //     return true;
        //   }
        //   return false;
        // }
      } catch (e) {
        return false;
      }
    },
  },
};

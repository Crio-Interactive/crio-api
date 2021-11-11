const { applyMiddleware, shield } = require('@tidepoollabs/node-auth');
const { buildFederatedSchema } = require('@apollo/federation');
const { isAuthenticated, isNotAuthenticated } = require('./permissions');
const typeDefs = require('../types/index');
const resolvers = require('../resolvers/index');

const schema = buildFederatedSchema([
  {
    typeDefs,
    resolvers,
  },
]);

module.exports = applyMiddleware(
  schema,
  shield({
    Query: {
      me: isAuthenticated,
      getUser: isAuthenticated,
      getCreatorUsers: isAuthenticated,
      getFollowings: isAuthenticated,
      isFollowing: isAuthenticated,
      getUploadUrl: isAuthenticated,
      getUploadImageLink: isAuthenticated,
      getArtworks: isAuthenticated,
      getUserArtworks: isAuthenticated,
    },
    Mutation: {
      saveUser: isAuthenticated,
      updateUser: isAuthenticated,
      createFollowing: isAuthenticated,
      createArtwork: isAuthenticated,
      updateArtworks: isAuthenticated,
      deleteArtwork: isAuthenticated,
      updateMetadata: isAuthenticated,
    },
  }),
);

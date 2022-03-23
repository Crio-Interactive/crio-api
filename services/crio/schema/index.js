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
      getFollowings: isAuthenticated,
      getFollowersCount: isAuthenticated,
      // isFollowing: isAuthenticated,
      getUploadUrl: isAuthenticated,
      getUploadImageLink: isAuthenticated,
      getArtwork: isAuthenticated,
      getRandomArtworksForFeed: isAuthenticated,
    },
    Mutation: {
      saveUser: isAuthenticated,
      updateUser: isAuthenticated,
      createFollowing: isAuthenticated,
      createArtwork: isAuthenticated,
      updateArtworks: isAuthenticated,
      deleteArtwork: isAuthenticated,
      updateMetadata: isAuthenticated,
      contactCreator: isAuthenticated,
      cancelSubscription: isAuthenticated,
    },
  }),
);

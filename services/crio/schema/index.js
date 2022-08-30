const { applyMiddleware, shield } = require('@tidepoollabs/node-auth');
const { buildFederatedSchema } = require('@apollo/federation');
const { isAuthenticated } = require('./permissions');
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
      getFollowersCount: isAuthenticated,
      getUploadUrl: isAuthenticated,
      getUploadImageLink: isAuthenticated,
      getConnectAccount: isAuthenticated,
      getConnectOnboardingLink: isAuthenticated,
      getConnectLoginLink: isAuthenticated,
      deleteStripeAccount: isAuthenticated,
      job: isAuthenticated,
      getInvitations: isAuthenticated,
      getUserInvitations: isAuthenticated,
    },
    Mutation: {
      saveUser: isAuthenticated,
      updateUser: isAuthenticated,
      createFollowing: isAuthenticated,
      createArtwork: isAuthenticated,
      deleteArtwork: isAuthenticated,
      updateMetadata: isAuthenticated,
      createProduct: isAuthenticated,
      updateProduct: isAuthenticated,
      deleteProduct: isAuthenticated,
      contactCreator: isAuthenticated,
      cancelSubscription: isAuthenticated,
      sendInvitation: isAuthenticated,
      createTransfers: isAuthenticated,
    },
  }),
);

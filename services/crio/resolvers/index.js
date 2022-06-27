const { mergeResolvers } = require('@graphql-tools/merge');
const scalarResolvers = require('./scalar.resolvers');
const userResolvers = require('./user.resolvers');
const followingResolvers = require('./following.resolvers');
const uploadResolvers = require('./upload.resolvers');
const artworkResolvers = require('./artwork.resolvers');
const productResolvers = require('./product.resolvers');
const stripeConnectResolvers = require('./stripe-connect.resolvers');

const resolvers = [
  scalarResolvers,
  userResolvers,
  followingResolvers,
  uploadResolvers,
  artworkResolvers,
  productResolvers,
  stripeConnectResolvers,
];

module.exports = mergeResolvers(resolvers);

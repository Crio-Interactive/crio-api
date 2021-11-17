const { mergeResolvers } = require('@graphql-tools/merge');
const scalarResolvers = require('./scalar.resolvers');
const userResolvers = require('./user.resolvers');
const followingResolvers = require('./following.resolvers');
const uploadResolvers = require('./upload.resolvers');
const artworkResolvers = require('./artwork.resolvers');
const subscriberResolvers = require('./subscriber.resolvers');

const resolvers = [
  scalarResolvers,
  userResolvers,
  followingResolvers,
  uploadResolvers,
  artworkResolvers,
  subscriberResolvers,
];

module.exports = mergeResolvers(resolvers);

const { mergeResolvers } = require('@graphql-tools/merge');
const userResolvers = require('./user.resolvers');
const followingResolvers = require('./following.resolvers');
const scalarResolvers = require('./scalar.resolvers');

const resolvers = [
  userResolvers,
  followingResolvers,
  scalarResolvers,
];

module.exports = mergeResolvers(resolvers);

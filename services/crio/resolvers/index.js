const { mergeResolvers } = require('@graphql-tools/merge');
const userResolvers = require('./user.resolvers');
const scalarResolvers = require('./scalar.resolvers');

const resolvers = [
  userResolvers,
  scalarResolvers,
];

module.exports = mergeResolvers(resolvers);

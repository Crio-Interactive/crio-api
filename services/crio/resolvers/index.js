const { mergeResolvers } = require('@graphql-tools/merge');
const userResolvers = require('./user.resolvers');
const followingResolvers = require('./following.resolvers');
const scalarResolvers = require('./scalar.resolvers');
const uploadResolvers = require('./upload.resolvers');

const resolvers = [userResolvers,followingResolvers, scalarResolvers, uploadResolvers];

module.exports = mergeResolvers(resolvers);

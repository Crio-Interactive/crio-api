const { mergeTypeDefs } = require('@graphql-tools/merge');
const userTypes = require('./user.types');
const followingTypes = require('./following.types');
const uploadTypes = require('./upload.types');
const artworkTypes = require('./artwork.types');

const types = [
  userTypes,
  followingTypes,
  uploadTypes,
  artworkTypes,
];

module.exports = mergeTypeDefs(types);

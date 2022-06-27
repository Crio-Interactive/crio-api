const { mergeTypeDefs } = require('@graphql-tools/merge');
const enumTypes = require('./enum.types');
const userTypes = require('./user.types');
const followingTypes = require('./following.types');
const uploadTypes = require('./upload.types');
const artworkTypes = require('./artwork.types');
const productTypes = require('./product.types');
const stripeConnectTypes = require('./stripe-connect.types');

const types = [
  enumTypes,
  userTypes,
  followingTypes,
  uploadTypes,
  artworkTypes,
  productTypes,
  stripeConnectTypes,
];

module.exports = mergeTypeDefs(types);

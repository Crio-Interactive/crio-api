const { mergeTypeDefs } = require('@graphql-tools/merge');
const userTypes = require('./user.types');
const uploadTypes = require('./upload.types');
const artworkTypes = require('./artwork.types');

const types = [userTypes, uploadTypes, artworkTypes];

module.exports = mergeTypeDefs(types);

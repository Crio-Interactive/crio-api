const { mergeTypeDefs } = require('@graphql-tools/merge');
const userTypes = require('./user.types');
const uploadTypes = require('./upload.types');

const types = [userTypes, uploadTypes];

module.exports = mergeTypeDefs(types);

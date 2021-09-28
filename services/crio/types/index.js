const { mergeTypeDefs } = require('@graphql-tools/merge');
const userTypes = require('./user.types');

const types = [userTypes];

module.exports = mergeTypeDefs(types);

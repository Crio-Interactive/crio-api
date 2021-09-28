const { rule, and, permissions, not } = require('@tidepoollabs/node-auth');
const { ApolloError } = require('apollo-server');

module.exports = {
  isAuthenticated: permissions.isAuthenticated,
  isNotAuthenticated: not(permissions.isAuthenticated),
};

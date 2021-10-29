const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    getUploadUrl(size: Int!): String
  }
`;

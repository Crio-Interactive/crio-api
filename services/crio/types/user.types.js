const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date

  input UserAttributes {
    email: String
    username: String
    firstName: String
    lastName: String
  }

  type UserInfo {
    id: ID
    email: String
    username: String
    firstName: String
  }

  type Query {
    me: UserInfo!
    getUser(id: ID!): UserInfo
  }

  type Mutation {
    updateUser(attributes: UserAttributes!): UserInfo!
    saveUser(username: String!): UserInfo!
  }
`;

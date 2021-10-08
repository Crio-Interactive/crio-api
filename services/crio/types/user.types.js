const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date

  input UserAttributes {
    userId: String
    email: String
    username: String
    firstName: String
    lastName: String
  }

  type UserInfo {
    id: ID
    userId: String
    email: String
    username: String
    firstName: String
    lastName: String
  }

  type Query {
    me: UserInfo!
    getUser(id: ID!): UserInfo
  }

  type Mutation {
    updateUser(attributes: UserAttributes!): UserInfo!
    saveUser(attributes: UserAttributes!): UserInfo!
  }
`;

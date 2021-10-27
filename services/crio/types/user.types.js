const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date

  input UserAttributes {
    userId: String
    fbUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
  }

  type UserInfo {
    id: ID
    userId: String
    fbUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
  }

  type Query {
    me: UserInfo!
    getUser(id: ID!): UserInfo
    getCreatorUsers: [UserInfo]
    getFollowings: [UserInfo]
    isFollowing(followingId: ID!): Boolean
  }

  type Mutation {
    saveUser: UserInfo!
    updateUser(attributes: UserAttributes!): UserInfo!
    createFollowing(followingId: ID!): Boolean
  }
`;

const { gql } = require('apollo-server');

module.exports = gql`
  scalar JSON

  input UserAttributes {
    userId: String
    fbUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
    visibility: JSON
  }

  type UserInfo {
    id: ID
    userId: String
    fbUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
    visibility: JSON
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

const { gql } = require('apollo-server');

module.exports = gql`
  type Work {
    artworkId: ID!
    videoUri: String!
    thumbnailUri: String!
    title: String!
    description: String!
  }

  type FollowingInfo {
    id: ID!
    providerType: String!
    providerUserId: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
  }

  type Query {
    getFollowings(username: String): [FollowingInfo]!
    getFollowersCount: Int!
    isFollowing(followingUsername: String!): Boolean!
  }

  type Mutation {
    createFollowing(followingUsername: String!): Boolean!
  }
`;

const { gql } = require('apollo-server');

module.exports = gql`
  type Work {
    videoUri: String!
    thumbnailUri: String!
    title: String!
    description: String!
  }

  type FollowingInfo {
    id: ID!
    userId: ID!
    providerType: String!
    providerUserId: String!
    name: String!
    email: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
    visibility: [String!]!
    artworks: [Work!]!
  }

  type Query {
    getFollowings: [FollowingInfo]!
    getFollowersCount: Int!
    isFollowing(followingId: ID!): Boolean!
  }

  type Mutation {
    createFollowing(followingId: ID!): Boolean!
  }
`;

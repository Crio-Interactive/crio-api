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
    userId: ID!
    providerType: String!
    providerUserId: String!
    name: String!
    email: String!
    username: String!
    firstName: String
    lastName: String
    avatar: String
    artworks: [Work!]!
  }

  type Query {
    getFollowings: [FollowingInfo]!
    getFollowersCount: Int!
    isFollowing(followingUsername: String!): Boolean!
  }

  type Mutation {
    createFollowing(followingUsername: String!): Boolean!
  }
`;

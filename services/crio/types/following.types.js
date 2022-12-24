const { gql } = require('apollo-server');

module.exports = gql`
  type Work {
    artworkId: ID!
    content: String!
    thumbnail: String!
    title: String!
    description: String!
  }

  type FollowingInfo {
    id: ID!
    followingId: ID!
    username: String!
    firstName: String
    lastName: String
    image: String
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

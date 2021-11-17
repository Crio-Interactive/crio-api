const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    getFollowings: [UserInfo]!
    isFollowing(followingId: ID!): Boolean!
  }

  type Mutation {
    createFollowing(followingId: ID!): Boolean!
  }
`;

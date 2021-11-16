const { gql } = require('apollo-server');

module.exports = gql`
  type Query {
    isSubscriber(subscriberId: ID!): Boolean!
  }

  type Mutation {
    createSubscriber(subscriberId: ID!): Boolean!
  }
`;

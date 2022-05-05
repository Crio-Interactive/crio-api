const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date
  scalar JSON

  input UserAttributes {
    userId: String
    providerType: String
    providerUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
    about: String
  }

  type response {
    error: String
  }

  type Voucher {
    tier1: Int
    tier2: Int
    tier3: Int
  }

  type Payment {
    customerEmail: String
    periodStart: Date
    periodEnd: Date
    subscriptionStatus: String
    lastEventSnapshot: JSON
    subscriptionCancel: Boolean
  }

  type UserInfo {
    id: ID
    userId: String
    providerType: String!
    providerUserId: String!
    email: String
    username: String
    firstName: String
    lastName: String
    avatar: String
    about: String
    isCreator: Boolean
    payment: Payment
    artworksCount: Int
    followersCount: Int
    followingsCount: Int
    isFollowing: Boolean
    followings: [ID]
  }

  input MailInfo {
    tier: String!
    creatorUsername: ID!
    message: String!
  }

  type Query {
    me: UserInfo
    getUser(username: String!): UserInfo
  }

  type Mutation {
    saveUser: response!
    updateUser(attributes: UserAttributes!): UserInfo!
    contactCreator(mailInfo: MailInfo!): Boolean!
    cancelSubscription: Boolean!
  }
`;

const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date
  scalar JSON

  input UserAttributes {
    userId: String
    fbUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
    visibility: [String]
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
  }

  type UserInfo {
    id: ID
    userId: String
    fbUserId: String
    email: String
    username: String
    firstName: String
    lastName: String
    visibility: [String]
    isCreator: Boolean
    vouchers: [Voucher]
    payments: [Payment]
  }

  type Query {
    me: UserInfo!
    getUser(id: ID!): UserInfo
    getCreatorUsers: [UserInfo]!
  }

  type Mutation {
    saveUser: UserInfo!
    updateUser(attributes: UserAttributes!): UserInfo!
  }
`;

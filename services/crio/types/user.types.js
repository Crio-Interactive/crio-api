const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date
  scalar JSON

  input UserAttributes {
    userId: String
    email: String
    username: String
    firstName: String
    lastName: String
    about: String
    featuresSeen: Boolean
    helpSeen: Boolean
    showRevenue: Boolean
    emailVisible: Boolean
    image: String
  }

  type Response {
    error: String
    userId: ID
  }

  type Payment {
    customerEmail: String
    periodStart: Date
    periodEnd: Date
    subscriptionStatus: String
    lastEventSnapshot: JSON
    subscriptionCancel: Boolean
  }

  type Categories {
    productCategories: [ID]
    artworkCategories: [ID]
  }

  type UserInfo {
    id: ID
    userId: String
    email: String
    username: String
    firstName: String
    lastName: String
    image: String
    about: String
    isCreator: Boolean
    payment: Payment
    productsCount: Int
    artworksCount: Int
    followersCount: Int
    followingsCount: Int
    isFollowing: Boolean
    followings: [ID]
    boughtProducts: [ID]
    featuresSeen: Boolean
    helpSeen: Boolean
    showRevenue: Boolean
    emailVisible: Boolean
    revenue: String
    productLikes: [ID]
    artworkLikes: [ID]
    categories: Categories
  }

  input MailInfo {
    productId: ID!
    message: String!
  }

  type CreatorsFollowersCount {
    firstName: String
    lastName: String
    email: String!
    stripe: Boolean!
    followersCount: String!
  }

  type Job {
    subscribersCount: Int!
    creatorsFollowersCount: [CreatorsFollowersCount]!
  }

  type EmailStatus {
    email: String!
    accept: Boolean!
  }
  type Invitations {
    username: String!
    emails: [EmailStatus!]!
  }

  type Image {
    userId: ID!
    image: String!
  }

  type Query {
    me: UserInfo
    getUser(username: String!): UserInfo
    job: Job
    getInvitations: [Invitations!]!
    getUserInvitations: [EmailStatus!]!
    getProfileImages: [Image!]!
  }

  type Mutation {
    saveUser: Response!
    updateUser(attributes: UserAttributes!): UserInfo!
    contactCreator(mailInfo: MailInfo!): Boolean!
    cancelSubscription: Boolean!
    sendInvitation(emails: [String!]!): Boolean!
    acceptInvitation(email: String!): Boolean!
    updateUserImage(userId: ID!, image: String!): Boolean!
  }
`;

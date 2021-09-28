const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date

  input UserAttributes {
    email: String
    name: String
    gender: String
    dob: Date
    age: Int
    weight: Float
    height: Float
    address: String
    diagnosis: String
    eventDate: Date
    cardiologist: String
    isVerified: Boolean
    isFaceIdEnabled: Boolean
    timezone: String
  }

  type UserInfo {
    id: ID
    username: String
    phoneNumber: String
    email: String
    name: String
    gender: String
    dob: Date
    age: Int
    weight: Float
    height: Float
    address: String
    diagnosis: String
    eventDate: Date
    cardiologist: String
    isVerified: Boolean
    isFaceIdEnabled: Boolean
    timezone: String
  }

  type Query {
    me: UserInfo!
    getUser(id: ID!): UserInfo
  }

  type Mutation {
    updateUser(attributes: UserAttributes!): UserInfo!
  }
`;

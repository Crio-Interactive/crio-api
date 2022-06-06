const { gql } = require('apollo-server');

module.exports = gql`
  scalar Date

  input PaymentMethodAttributes {
    id: ID
    firstName: String!
    lastName: String!
    email: String!
    dob: Date!
    city: String!
    state: String!
    postalCode: String!
    address: String!
    bankAccount: String!
    bankRouting: String!
  }

  type PaymentMethod {
    id: ID
    userId: String
    firstName: String
    lastName: String
    email: String
    dob: Date
    city: String
    state: String
    postalCode: String
    address: String
    bankAccount: String
    bankRouting: String
  }

  type Query {
    getPaymentMethod: PaymentMethod!
  }

  type Mutation {
    savePaymentMethod(attributes: PaymentMethodAttributes!): Boolean!
    updatePaymentMethod(attributes: PaymentMethodAttributes!): Boolean!
  }
`;

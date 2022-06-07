const { gql } = require('apollo-server');

module.exports = gql`
  type ConnectAccount {
    charges_enabled: Boolean
    details_submitted: Boolean
  }

  type Link {
    url: String!
  }

  type Query {
    getConnectAccount: ConnectAccount!
    getConnectOnboardingLink: Link!
    getConnectLoginLink: Link!
  }
`;

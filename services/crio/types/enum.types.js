const { gql } = require('apollo-server');

module.exports = gql`
  enum Accessibility {
    subscriber_only
    everyone
  }
`;

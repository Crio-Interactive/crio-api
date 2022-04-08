const { gql } = require('apollo-server');

module.exports = gql`
  enum Accessibility {
    subscribed
    everyone
  }
`;

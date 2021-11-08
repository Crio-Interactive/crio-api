const { gql } = require('apollo-server');

module.exports = gql`
  type Artwork {
    id: ID!
    userId: ID!
    videoUri: String!
    thumbnailUri: String!
    title: String!
    description: String!
    status: String!
    pictures_uri: String!
  }

  type Query {
    getArtworks: [Artwork!]!
  }

  type Mutation {
    createArtwork(videoUri: String!): Artwork
    deleteArtwork(artworkId: ID!): Boolean
  }
`;

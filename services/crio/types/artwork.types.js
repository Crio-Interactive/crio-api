const { gql } = require('apollo-server');

module.exports = gql`
  type Artwork {
    id: ID!
    artworkId: ID!
    userId: ID!
    videoUri: String!
    thumbnailUri: String!
    title: String!
    description: String!
    status: String!
    pictures_uri: String!
  }

  type WorkDetail {
    id: ID!
    artworkId: ID
    userId: ID!
    fbUserId: String!
    name: String!
    videoUri: String!
    thumbnailUri: String!
    title: String!
    description: String!
  }

  input DeletingParams {
    artworkId: ID
    videoUri: String
  }

  input paginationParams {
    count: Int!
    userId: ID
    artworkId: ID
    limit: Int
    offset: Int
  }

  type Query {
    getArtworks: [Artwork!]!
    getUserArtworks(id: ID): [WorkDetail!]!
    getRandomArtworksCount: Int!
    getRandomArtworks(params: paginationParams!): [WorkDetail]!
  }

  type Mutation {
    createArtwork(videoUri: String!): Artwork
    updateArtworks: Boolean
    deleteArtwork(params: DeletingParams!): Boolean
  }
`;

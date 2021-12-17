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
    providerType: String!
    providerUserId: String!
    avatar: String
    name: String!
    videoUri: String!
    thumbnailUri: String!
    title: String!
    description: String!
    status: String
  }

  input DeletingParams {
    artworkId: ID
    videoUri: String
  }

  input paginationParams {
    count: Int
    userId: ID
    artworkId: ID
    limit: Int
    offset: Int
  }

  type randomArtworksInfo {
    count: Int!
    creatorIds: [ID!]!
    artworks: [WorkDetail!]!
  }

  type feedArtworks {
    topArtworks: [WorkDetail]
    userArtworks: [WorkDetail]
    artworks: [WorkDetail]
  }

  type Query {
    getArtworks: [Artwork!]!
    getUserArtworks(id: ID): [WorkDetail!]!
    getRandomArtworksInfo: randomArtworksInfo!
    getRandomArtworks(params: paginationParams!): [WorkDetail]!
    getRandomArtworksForFeed(params: paginationParams!): feedArtworks!
  }

  type Mutation {
    createArtwork(videoUri: String!): Artwork
    updateArtworks: Boolean
    deleteArtwork(params: DeletingParams!): Boolean
  }
`;

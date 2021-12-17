const { gql } = require('apollo-server');

module.exports = gql`
  type Artwork {
    id: ID!
    artworkId: ID!
    userId: ID!
    videoId: String!
    title: String!
    description: String!
    status: String!
  }

  type WorkDetail {
    id: ID!
    artworkId: ID
    userId: ID!
    providerType: String!
    providerUserId: String!
    avatar: String
    name: String!
    videoId: String!
    title: String!
    description: String!
    status: String
  }

  input DeletingParams {
    artworkId: ID
    videoId: String
  }

  input paginationParams {
    count: Int!
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
    createArtwork(videoId: String!): Artwork
    updateArtworks: Boolean
    deleteArtwork(params: DeletingParams!): Boolean
  }
`;

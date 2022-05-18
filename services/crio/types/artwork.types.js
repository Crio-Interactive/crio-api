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
    accessibility: Accessibility!
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
    creatorIds: [ID!]
    artworks: [WorkDetail!]!
  }

  type feedArtworks {
    topArtworks: [WorkDetail]
    userArtworks: [WorkDetail]
    artworks: [WorkDetail]
  }

  type Query {
    getArtwork(artworkId: ID!): WorkDetail
    getUserArtworks(username: String): [WorkDetail!]!
    getRandomArtworksInfo: randomArtworksInfo!
    getRandomArtworks(params: paginationParams!): [WorkDetail]!
  }

  type Mutation {
    createArtwork(videoUri: String!): Artwork
    deleteArtwork(params: DeletingParams!): Boolean
  }
`;

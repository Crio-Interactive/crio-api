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
    artworkId: ID
    userId: ID!
    username: String!
    providerType: String!
    providerUserId: String!
    avatar: String
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

  type randomInfo {
    productsCount: Int!
    artworksCount: Int!
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
    getRandomInfo: randomInfo!
    getRandomArtworks(params: paginationParams!): [WorkDetail]!
  }

  type Mutation {
    createArtwork(videoUri: String!): Artwork
    deleteArtwork(params: DeletingParams!): Boolean
  }
`;

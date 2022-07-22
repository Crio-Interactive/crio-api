const { gql } = require('apollo-server');

module.exports = gql`
  type ArtworkId {
    id: ID!
  }

  type Artwork {
    id: ID!
    artworkId: ID!
    userId: ID!
    content: String!
    thumbnail: String!
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
    content: String!
    thumbnail: String!
    title: String!
    description: String!
    status: String
    accessibility: Accessibility!
  }

  input ArtworkParams {
    content: String!
    thumbnail: String
    title: String
    description: String
    accessibility: Accessibility
    isVideo: Boolean
  }

  input DeletingParams {
    artworkId: ID
    content: String
  }

  input paginationParams {
    count: Int
    userId: ID
    artworkId: ID
    limit: Int
    offset: Int
    keyword: String
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
    getRandomInfo(keyword: String): randomInfo!
    getRandomArtworks(params: paginationParams!): [WorkDetail]!
  }

  type Mutation {
    createArtwork(params: ArtworkParams!): ArtworkId!
    deleteArtwork(params: DeletingParams!): Boolean
  }
`;

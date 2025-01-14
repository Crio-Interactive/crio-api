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
    image: String
    content: String!
    thumbnail: String!
    title: String!
    description: String!
    status: String
    accessibility: Accessibility!
    categoryId: ID
    likes: Int
  }

  input ArtworkParams {
    content: String!
    thumbnail: String
    title: String
    description: String
    accessibility: Accessibility
    categoryId: ID
    isVideo: Boolean
  }

  input DeletingParams {
    artworkId: ID
    content: String
  }

  input paginationParams {
    userId: ID
    artworkId: ID
    limit: Int
    offset: Int
    categoryId: String
    keyword: String
  }

  input UserAttributesParams {
    username: String!
    categoryId: ID
  }

  type feedArtworks {
    topArtworks: [WorkDetail]
    userArtworks: [WorkDetail]
    artworks: [WorkDetail]
  }

  type ArtworkLikes {
    userId: Int!
  }

  type Query {
    getArtwork(artworkId: ID!): WorkDetail
    getUserArtworks(params: UserAttributesParams!): [WorkDetail!]!
    getRandomArtworks(params: paginationParams!): [WorkDetail]!
    getArtworkLikes(artworkId: ID!): [ArtworkLikes!]!
  }

  type Mutation {
    createArtwork(params: ArtworkParams!): ArtworkId!
    deleteArtwork(params: DeletingParams!): Boolean
    likeArtwork(artworkId: ID!): Int
  }
`;

const { gql } = require('apollo-server');

module.exports = gql`
  type UploadInfo {
    uri: String!
    upload_link: String!
    status: String!
    pictures_uri: String!
  }

  type UploadImageInfo {
    uri: String!
    link: String!
  }

  input ThumbnailParams {
    artworkId: ID!
    title: String
    description: String
    accessibility: Accessibility
    uri: String
    thumbnail: String
  }

  type Query {
    getUploadUrl(size: Int!): UploadInfo!
    getUploadImageLink(artworkId: ID!): UploadImageInfo!
  }

  type Mutation {
    updateMetadata(params: ThumbnailParams!): Boolean
  }
`;

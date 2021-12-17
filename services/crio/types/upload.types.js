const { gql } = require('apollo-server');

module.exports = gql`
  type UploadInfo {
    uri: String!
    upload_link: String!
    status: String!
  }

  type UploadImageInfo {
    uri: String!
    link: String!
  }

  input ThumbnailParams {
    artworkId: ID!
    title: String
    description: String
    uri: String
  }

  type Query {
    getUploadUrl(size: Int!): UploadInfo!
    getUploadImageLink(artworkId: ID!): UploadImageInfo!
  }

  type Mutation {
    updateMetadata(params: ThumbnailParams!): Boolean
  }
`;

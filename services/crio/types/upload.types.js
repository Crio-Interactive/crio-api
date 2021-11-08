const { gql } = require('apollo-server');

module.exports = gql`
  type UploadInfo {
    uri: String!
    upload_link: String!
    status: String!
    pictures_uri: String!
  }

  input ThumbnailParams {
    artworkId: ID!
    image: String
    mime: String
    title: String
    description: String
  }

  type Query {
    getUploadUrl(size: Int!): UploadInfo!
  }

  type Mutation {
    updateMetadata(params: ThumbnailParams!): Boolean
  }
`;

const { gql } = require('apollo-server');

module.exports = gql`
  input Product {
    id: ID
    categoryId: ID!
    title: String!
    description: String
    price: Float
    limit: Int
    accessibility: Accessibility!
    thumbnail: String
    thumbnails: [String]
    file: String
  }

  type Category {
    id: ID!
    name: String!
    type: String
    mainCategoryId: ID
  }

  type ProductDetail {
    productId: ID!
    userId: ID!
    username: String!
    providerType: String!
    providerUserId: String!
    avatar: String
    categoryId: ID!
    title: String!
    description: String
    price: Float
    limit: Int
    accessibility: Accessibility!
    thumbnail: String
    file: String
    likes: Int
  }

  input DeletingParams {
    productId: ID
    thumbnail: String
  }

  input paginationParams {
    userId: ID
    productId: ID
    limit: Int
    offset: Int
    categoryId: String
    keyword: String
  }

  input SearchParams {
    keyword: String
    productCategoryId: String
    artworkCategoryId: String
  }

  input UserAttributesParams {
    username: String!
    categoryId: ID
  }

  type RandomInfo {
    productsCount: Int!
    artworksCount: Int!
  }

  type MoreProducts {
    userProducts: [ProductDetail!]!
    products: [ProductDetail!]!
  }

  type StripeCheckoutSession {
    url: String!
  }

  type ProductLikes {
    userId: Int!
  }

  type Query {
    getProduct(productId: ID!): ProductDetail
    getCategories: [Category]!
    getUserProducts(params: UserAttributesParams!): [ProductDetail!]!
    getTopProducts: [ProductDetail!]!
    getRandomInfo(params: SearchParams!): RandomInfo!
    getRandomProducts(params: paginationParams!): [ProductDetail]!
    getMoreProducts(params: paginationParams!): MoreProducts!
    getStripeCheckoutSession(productId: ID!): StripeCheckoutSession!
    getProductLikes(productId: ID!): [ProductLikes!]!
  }

  type Mutation {
    createProduct(attributes: Product!): Boolean
    updateProduct(attributes: Product!): Boolean
    deleteProduct(productId: ID!): Boolean
    likeProduct(productId: ID!): Int
  }
`;

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
  }

  input DeletingParams {
    productId: ID
    thumbnail: String
  }

  input paginationParams {
    count: Int
    userId: ID
    productId: ID
    limit: Int
    offset: Int
  }

  type randomProductsInfo {
    count: Int!
    products: [ProductDetail!]!
    keyword: String
  }

  type MoreProducts {
    userProducts: [ProductDetail!]!
    products: [ProductDetail!]!
  }

  type StripeCheckoutSession {
    url: String!
  }

  type Query {
    getProduct(productId: ID!): ProductDetail
    getCategories: [Category]!
    getUserProducts(username: String): [ProductDetail!]!
    getRandomProductsInfo: randomProductsInfo!
    getRandomProducts(params: paginationParams!): [ProductDetail]!
    getMoreProducts(params: paginationParams!): MoreProducts!
    getStripeCheckoutSession(productId: ID!): StripeCheckoutSession!
  }

  type Mutation {
    createProduct(attributes: Product!): Boolean
    updateProduct(attributes: Product!): Boolean
    deleteProduct(productId: ID!): Boolean
  }
`;

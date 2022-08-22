const {
  createCheckoutSession,
  createPrice,
  createProduct,
  retrieveAccount,
} = require('../utils/stripe.helper');

module.exports = {
  Query: {
    getProduct: async (_, { productId }, { loaders }) => loaders.productById.load(productId),
    getProductTypes: async (_, {}, { models }) => models.ProductType.findAll(),
    getUserProducts: async (_, { username }, { user, loaders }) => {
      let userId;
      if (username) {
        const user = await loaders.userByUsername.load(username);
        userId = user?.id;
      }
      if (!userId) {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        userId = id;
      }
      return loaders.productsByUserId.load(userId);
    },
    getMoreProducts: async (_, { params: { userId, productId } }, { models }) => {
      const userProducts = models.RandomProduct.findAll({
        where: productId
          ? { userId, productId: { [models.sequelize.Sequelize.Op.ne]: productId } }
          : { userId },
        order: [models.sequelize.literal('Random()')],
        limit: 3,
      });
      const products = models.RandomProduct.findAll({
        where: { userId: { [models.sequelize.Sequelize.Op.ne]: userId } },
        order: [models.sequelize.literal('Random()')],
        limit: 4,
      });
      return { userProducts, products };
    },
    getRandomProductsInfo: async (_, {}, { models }) => {
      const count = await models.RandomProduct.count();
      const [products] = await models.sequelize.query(`
        SELECT  *
        FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY Random()) AS RowNumber
                FROM "RandomProducts") AS products
        WHERE products.RowNumber = 1
        ORDER BY Random()
        LIMIT 4
      `);
      return { count, products };
    },
    getRandomProducts: async (
      _,
      { params: { count, userId, productId, limit = 15, offset = 0, keyword } },
      { models },
    ) => {
      let condition = {};
      if (userId) {
        condition = {
          where: { userId, productId: { [models.sequelize.Sequelize.Op.ne]: productId } },
        };
      } else if (keyword) {
        condition = {
          where: {
            [models.sequelize.Sequelize.Op.or]: [
              {
                username: {
                  [models.sequelize.Sequelize.Op.iLike]: `%${keyword}%`,
                },
              },
              {
                title: {
                  [models.sequelize.Sequelize.Op.iLike]: `%${keyword}%`,
                },
              },
            ],
          },
        };
      }
      return models.RandomProduct.findAll({
        ...condition,
        order: [models.sequelize.literal(count ? `id % ${count}` : 'Random()')],
        limit,
        offset,
      });
    },
    getStripeCheckoutSession: async (_, { productId }, { user, loaders }) => {
      try {
        if (!productId) {
          return;
        }
        let loggedInUser;
        if (user?.attributes?.sub) {
          loggedInUser = await loaders.userByUserId.load(user.attributes.sub);
        }
        const product = await loaders.productById.load(productId);
        const { stripeAccountId } = await loaders.userById.load(product.userId);

        if (!stripeAccountId) {
          return new Error('Creator payouts are off. Please contact Support.');
        }
        const { charges_enabled } = await retrieveAccount(stripeAccountId);
        if (!charges_enabled) {
          return new Error('Creator payouts are off. Please contact Support.');
        }

        const { id } = await createProduct(product.userId, product.title, product.thumbnail);
        const price = await createPrice(id, product.price);

        const session = await createCheckoutSession(
          loggedInUser?.id,
          productId,
          price.id,
          stripeAccountId,
          ((product.price * 10) / 100) * 100,
        );

        return { url: session.url };
      } catch (e) {
        console.log('Error creating Checkout Session ', e);
        return e;
      }
    },
  },
  Mutation: {
    createProduct: async (_, { attributes }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const productTypes = await models.ProductType.findOne({
          where: { name: 'Digital Product' },
        });
        await models.Product.create({
          userId: id,
          productTypeId: attributes.productTypeId,
          title: attributes.title,
          description: attributes.description,
          price: attributes.price,
          limit: attributes.limit,
          accessibility: attributes.accessibility,
          thumbnail: attributes.thumbnail || null,
          file:
            +attributes.productTypeId === productTypes.id && attributes.file
              ? attributes.file
              : null,
        });
        return true;
      } catch (e) {
        return e;
      }
    },
    updateProduct: async (_, { attributes }, { user, loaders, models }) => {
      try {
        const product = await loaders.productById.load(attributes.id);
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        if (product.userId !== id) {
          throw new Error('A product does not belong to you');
        }
        const productTypes = await models.ProductType.findOne({ where: { name: 'Service' } });
        await models.Product.update(
          {
            userId: product.userId,
            productTypeId: attributes.productTypeId,
            title: attributes.title,
            description: attributes.description,
            price: attributes.price || null,
            limit: attributes.limit || null,
            accessibility: attributes.accessibility,
            thumbnail: attributes.thumbnail === 'remove-thumbnail' ? null : attributes.thumbnail,
            file:
              +attributes.productTypeId === productTypes.id ? null : attributes.file || undefined,
          },
          { where: { id: attributes.id } },
        );
        return true;
      } catch (e) {
        return e;
      }
    },
    deleteProduct: async (_, { productId }, { user, loaders, models }) => {
      try {
        const product = await loaders.productById.load(productId);
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        if (product.userId !== id) {
          throw new Error('A product does not belong to you');
        }
        await models.Product.destroy({ where: { id: productId } });
        return true;
      } catch (e) {
        return e;
      }
    },
  },
};

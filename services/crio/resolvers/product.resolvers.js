const { CLIENT_URL, STRIPE_API_KEY } = require('../config/environment');
const stripe = require('stripe')(STRIPE_API_KEY);

module.exports = {
  Query: {
    getProduct: async (_, { productId }, { loaders }) => loaders.productById.load(productId),
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
      { params: { count, userId, productId, limit = 15, offset = 0 } },
      { models },
    ) =>
      models.RandomProduct.findAll({
        ...(userId
          ? { where: { userId, productId: { [models.sequelize.Sequelize.Op.ne]: productId } } }
          : {}),
        order: [models.sequelize.literal(count ? `id % ${count}` : 'Random()')],
        limit,
        offset,
      }),
    getStripeCheckoutSession: async (_, { productId }, { user, loaders }) => {
      if (!productId) {
        return;
      }
      let loggedInUser;
      if (user?.attributes?.sub) {
        loggedInUser = await loaders.userByUserId.load(user.attributes.sub);
      }
      const product = await loaders.productById.load(productId);

      const { id } = await stripe.products.create({
        name: product.title,
        images: product.thumbnail
          ? [
              `https://crio-in-staging-bucket.s3.us-west-2.amazonaws.com/${product.userId}/products/thumbnail-${product.thumbnail}`,
            ]
          : [],
        url: `${CLIENT_URL}pricing`,
      });
      const price = await stripe.prices.create({
        product: id,
        unit_amount: product.price * 100,
        currency: 'usd',
      });

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${CLIENT_URL}product/${productId}`,
        cancel_url: `${CLIENT_URL}product/${productId}`,
        metadata: { productId, userId: loggedInUser?.id },
      });

      return { url: session.url };
    },
  },
  Mutation: {
    createProduct: async (_, { attributes }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        await models.Product.create({
          userId: id,
          type: attributes.type,
          title: attributes.title,
          description: attributes.description,
          price: attributes.price,
          limit: attributes.limit,
          accessibility: attributes.accessibility,
          thumbnail: attributes.thumbnail || null,
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
        await models.Product.update(
          {
            userId: product.userId,
            type: attributes.type,
            title: attributes.title,
            description: attributes.description,
            price: attributes.price || null,
            limit: attributes.limit || null,
            accessibility: attributes.accessibility,
            thumbnail: attributes.thumbnail === 'remove-thumbnail' ? null : attributes.thumbnail,
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

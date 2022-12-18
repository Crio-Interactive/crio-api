const {
  createCheckoutSession,
  createPrice,
  createProduct,
  retrieveAccount,
} = require('../utils/stripe.helper');

const attributes = [
  'User.username',
  'User.providerType',
  'User.providerUserId',
  'User.avatar',
  'title',
  'description',
  'accessibility',
];

const productAttributes = [
  ...attributes,
  'Product.userId',
  'categoryId',
  'price',
  'limit',
  'thumbnails',
  'file',
];

module.exports = {
  Query: {
    getProduct: async (_, { productId }, { loaders }) => loaders.productById.load(productId),
    getCategories: async (_, {}, { models }) => models.Category.findAll({ order: [['name']] }),
    getUserProducts: async (_, { params: { username, categoryId } }, { user, models, loaders }) => {
      let userId;
      if (username) {
        const user = await loaders.userByUsername.load(username);
        userId = user?.id;
      }
      if (!userId) {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        userId = id;
      }
      let where = { userId };
      if (categoryId && categoryId !== 'all') {
        where = categoryId === 'free' ? { userId, price: null } : { userId, categoryId };
      }

      return models.Product.findAll({
        raw: true,
        attributes: [
          ...productAttributes,
          ['id', 'productId'],
          [models.sequelize.literal('count("ProductLikes"."productId")'), 'likes'],
        ],
        group: [...productAttributes, 'Product.id', 'ProductLikes.productId'],
        order: [['id', 'DESC']],
        include: [
          {
            attributes: [],
            model: models.User,
          },
          {
            attributes: [],
            model: models.ProductLike,
          },
        ],
        where,
      });
    },
    getTopProducts: async (_, {}, { models }) => {
      const [products] = await models.sequelize.query(`
        SELECT  *
        FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY Random()) AS RowNumber
              FROM "RandomProducts"
              WHERE "userId" IN (SELECT "followingId"
                                FROM "Followings"
                                WHERE "Followings"."deletedAt" IS NULL
                                GROUP BY "followingId"
                                ORDER BY count(*) DESC
                                LIMIT 4)) AS products
        WHERE products.RowNumber = 1
        ORDER BY Random()
        LIMIT 4
      `);
      return products;
    },
    getRandomInfo: async (
      _,
      { params: { keyword, productCategoryId, artworkCategoryId } },
      { models },
    ) => {
      let where = {};
      if (keyword) {
        where = {
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
        };
      }
      let whereProducts = { ...where };
      if (productCategoryId && productCategoryId !== 'all') {
        whereProducts =
          productCategoryId === 'free'
            ? { ...where, price: null }
            : { ...where, categoryId: productCategoryId };
      }
      const productsCount = await models.RandomProduct.count({ where: whereProducts });
      const artworksCount = await models.RandomArtwork.count(
        artworkCategoryId && artworkCategoryId !== 'all'
          ? { where: { ...where, categoryId: artworkCategoryId } }
          : { where },
      );

      return { productsCount, artworksCount };
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
    getRandomProducts: async (
      _,
      { params: { limit = 15, offset = 0, categoryId, keyword } },
      { models },
    ) => {
      let where = {};
      if (keyword) {
        where = {
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
        };
      }
      if (categoryId && categoryId !== 'all') {
        where = categoryId === 'free' ? { ...where, price: null } : { ...where, categoryId };
      }
      return models.RandomProduct.findAll({
        where,
        order: [['likes', 'DESC']],
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

        const { id } = await createProduct(product.userId, product.title, product.thumbnails);
        const price = await createPrice(id, product.price);

        const session = await createCheckoutSession(
          loggedInUser?.id,
          productId,
          price.id,
          stripeAccountId,
          ((product.price * 5) / 100) * 100,
        );

        return { url: session.url };
      } catch (e) {
        console.log('Error creating Checkout Session ', e);
        return e;
      }
    },
    getProductLikes: async (_, { productId }, { loaders }) =>
      loaders.productLikesById.load(productId),
  },
  Mutation: {
    createProduct: async (_, { attributes }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const { id: commissionCategoryId } = await models.Category.findOne({
          where: { name: 'Commissions' },
        });
        if (+attributes.categoryId !== commissionCategoryId && !attributes.file) {
          throw new Error('A digital product must have a file');
        }
        await models.Product.create({
          userId: id,
          categoryId: attributes.categoryId,
          title: attributes.title,
          description: attributes.description,
          price: attributes.price,
          limit: attributes.limit,
          accessibility: attributes.accessibility,
          thumbnails: attributes.thumbnails,
          file: attributes.file || null,
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
        const { id: commissionCategoryId } = await models.Category.findOne({
          where: { name: 'Commissions' },
        });
        if (+attributes.categoryId !== commissionCategoryId && !(attributes.file || product.file)) {
          throw new Error('A digital product must have a file');
        }
        await models.Product.update(
          {
            userId: product.userId,
            categoryId: attributes.categoryId,
            title: attributes.title,
            description: attributes.description,
            price: attributes.price || null,
            limit: attributes.limit || null,
            accessibility: attributes.accessibility,
            thumbnails: attributes.thumbnails,
            file:
              +attributes.categoryId === commissionCategoryId ? null : attributes.file || undefined,
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
    likeProduct: async (_, { productId }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const like = await models.ProductLike.findOne({
          raw: true,
          attributes: ['userId'],
          where: {
            productId,
            userId: id,
          },
        });

        if (!like) {
          await models.ProductLike.create({
            productId,
            userId: id,
          });
        } else {
          await models.ProductLike.destroy({
            where: {
              productId,
              userId: id,
            },
          });
        }
        return models.ProductLike.count({ where: { productId } });
      } catch (e) {
        return e;
      }
    },
  },
};

const sendMail = require('../config/mail');
const { SENDGRID_CC_EMAILS } = require('../config/environment');

const AMOUNT = 6.5;

module.exports = {
  UserInfo: {
    isCreator: async (parent, {}, { loaders }) => loaders.isCreator.load(parent.email),
    payment: async (parent, {}, { models }) =>
      models.Payment.findOne({ where: { userId: parent.id } }),
    productsCount: (parent, {}, { models }) =>
      models.Product.count({ where: { userId: parent.id } }),
    artworksCount: (parent, {}, { models }) =>
      models.Artwork.count({ where: { userId: parent.id } }),
    followersCount: (parent, {}, { models }) =>
      models.Following.count({ where: { followingId: parent.id } }),
    followings: async (parent, {}, { models }) => {
      const followings = await models.Following.findAll({ where: { userId: parent.id } });
      return followings ? followings.map(({ followingId }) => followingId) : [];
    },
    productLikes: async (parent, {}, { models }) => {
      const likes = await models.ProductLike.findAll({
        attributes: ['productId'],
        where: { userId: parent.id },
      });
      return likes.map(({ productId }) => productId);
    },
    artworkLikes: async (parent, {}, { models }) => {
      const likes = await models.ArtworkLike.findAll({
        attributes: ['artworkId'],
        where: { userId: parent.id },
      });
      return likes.map(({ artworkId }) => artworkId);
    },
    boughtProducts: async (parent, {}, { models }) => {
      const products = await models.ProductCustomer.findAll({ where: { userId: parent.id } });
      return products ? products.map(({ productId }) => productId) : [];
    },
    revenue: async (parent, {}, { models, loaders }) => {
      const isCreator = await loaders.isCreator.load(parent.email);
      if (isCreator) {
        const [subscribersCount] = await models.sequelize.query(`
          SELECT COUNT(*) FROM "Payments"
          WHERE "Payments"."subscriptionStatus" = 'active'
              AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
        `);
        const [followersCount] = await models.sequelize.query(`
          SELECT
            (SELECT COUNT(*)
            FROM "Followings"
              INNER JOIN "Payments" ON "Followings"."userId"="Payments"."userId"
                                    AND "Payments"."subscriptionStatus" = 'active'
                                    AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
            WHERE "Followings"."followingId"="Users"."id"
              AND "Followings"."deletedAt" IS NULL) AS "followersCount"
          FROM "Users" INNER JOIN "Creators" ON "Users"."email" = "Creators"."email"
          WHERE "Users".id=${parent.id}
        `);
        const [totalFollowersCount] = await models.sequelize.query(`
          SELECT SUM(
            (SELECT COUNT(*)
             FROM "Followings"
               INNER JOIN "Payments" ON "Followings"."userId"="Payments"."userId"
                                     AND "Payments"."subscriptionStatus" = 'active'
                                     AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
             WHERE "Followings"."followingId"="Users"."id" AND "Followings"."deletedAt" IS NULL))
          FROM "Users" INNER JOIN "Creators" ON "Users"."email" = "Creators"."email"
          WHERE "Users"."deletedAt" IS NULL AND "Creators"."deletedAt" IS NULL
        `);
        const price = (AMOUNT * subscribersCount[0].count * 80) / 100;
        return ((+followersCount[0].followersCount / totalFollowersCount[0].sum) * price).toFixed(
          2,
        );
      }
      return null;
    },
    categories: async (parent, {}, { models, loaders }) => {
      let categories = [];
      const isCreator = await loaders.isCreator.load(parent.email);
      if (isCreator) {
        categories = await models.Category.findAll({
          raw: true,
          attributes: [
            models.sequelize.literal(
              `array_remove(ARRAY_AGG(DISTINCT "Products"."categoryId"), NULL) AS "productCategories",
               array_remove(ARRAY_AGG(DISTINCT "Artworks"."categoryId"), NULL) AS "artworkCategories"`,
            ),
          ],
          include: [
            {
              attributes: [],
              model: models.Product,
              where: { userId: parent.id },
              required: false,
            },
            {
              attributes: [],
              model: models.Artwork,
              where: { userId: parent.id },
              required: false,
            },
          ],
        });
      }
      return categories[0];
    },
  },
  Query: {
    me: async (_, {}, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUser: async (_, { username }, { user: loggedInUser, loaders, models }) => {
      const user = await loaders.userByUsername.load(username);
      if (!user) {
        return {};
      }
      const userId = user.id;
      const productsCount = await models.Product.count({ where: { userId } });
      const artworksCount = await models.Artwork.count({ where: { userId } });
      const followersCount = await models.Following.count({ where: { userId } });
      const followingsCount = await models.Following.count({ where: { followingId: userId } });
      const isFollowing = loggedInUser ? await loaders.isFollowing.load(userId) : false;
      return {
        ...user.dataValues,
        productsCount,
        artworksCount,
        followersCount,
        followingsCount,
        isFollowing,
      };
    },
    getInvitations: async (_, {}, { models }) => {
      const invitations = await models.Invitation.findAll({
        raw: true,
        attributes: ['User.username', 'Invitation.email'],
        include: {
          attributes: [],
          model: models.User,
        },
      });
      const creators = (await models.Creator.findAll({ attributes: ['email'] }))?.map(
        ({ email }) => email,
      );
      const inviters = invitations.reduce((acc, item) => {
        const index = acc.findIndex(user => user.username === item.username);
        if (index > 0) {
          acc[index].emails.push({ email: item.email, accept: creators.includes(item.email) });
        } else {
          acc.push({
            ...item,
            email: undefined,
            emails: [{ email: item.email, accept: creators.includes(item.email) }],
          });
        }
        return acc;
      }, []);
      return inviters;
    },
    getUserInvitations: async (_, {}, { user, loaders, models }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      const invitations = await models.Invitation.findAll({ where: { userId: id } });
      const creators = (await models.Creator.findAll({ attributes: ['email'] }))?.map(
        ({ email }) => email,
      );
      return invitations.map(({ email }) => ({ email, accept: creators.includes(email) }));
    },
    job: async (_, {}, { models }) => {
      const [subscribersCount] = await models.sequelize.query(`
        SELECT COUNT(*) FROM "Payments"
        WHERE "Payments"."subscriptionStatus" = 'active'
            AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
      `);
      const [creatorsFollowersCount] = await models.sequelize.query(`
        SELECT
          "Users"."firstName",
          "Users"."lastName",
          "Users"."email",
          CASE WHEN "Users"."stripeAccountId" IS NULL THEN false ELSE true END AS "stripe",
          (SELECT COUNT(*)
          FROM "Followings"
            INNER JOIN "Payments" ON "Followings"."userId"="Payments"."userId"
                                  AND "Payments"."subscriptionStatus" = 'active'
                                  AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
          WHERE "Followings"."followingId"="Users"."id"
            AND "Followings"."deletedAt" IS NULL) AS "followersCount"
        FROM "Users" INNER JOIN "Creators" ON "Users"."email" = "Creators"."email"
        WHERE "Users"."deletedAt" IS NULL AND "Creators"."deletedAt" IS NULL
      `);
      return { subscribersCount: subscribersCount[0].count, creatorsFollowersCount };
    },
  },
  Mutation: {
    saveUser: async (_, {}, { user, loaders, models }) => {
      try {
        const attr = user.attributes;
        if (!attr.email) {
          return { error: 'You need to use a Facebook account associated with an email' };
        }
        let existingUser = await models.User.findOne({
          where: {
            email: attr.email,
            userId: { [models.sequelize.Sequelize.Op.ne]: attr.sub },
          },
        });
        if (existingUser) {
          const identity = JSON.parse(attr.identities)[0];
          if (identity.userId === existingUser.providerUserId) {
            await models.User.update({ userId: attr.sub }, { where: { id: existingUser.id } });
            return {};
          }
          return { error: `${attr.email} email address is already registered` };
        }
        existingUser = await loaders.userByUserId.load(attr.sub);
        if (!existingUser) {
          const identity = JSON.parse(attr.identities)[0];
          const { id } = await models.User.create({
            userId: attr.sub,
            providerType: identity.providerType,
            providerUserId: identity.userId,
            email: attr.email,
            username: `${attr.email.substring(0, attr.email.indexOf('@'))}`.toLowerCase(),
            firstName: attr.given_name,
            lastName: attr.family_name,
          });
          return { userId: id };
        }
        return {};
      } catch (e) {
        return e;
      }
    },
    updateUser: async (_, { attributes }, { user, models }) => {
      try {
        const [, updatedUser] = await models.User.update(attributes, {
          where: { userId: user.attributes.sub },
          returning: true,
        });
        return updatedUser?.[0].dataValues;
      } catch (e) {
        return e;
      }
    },
    sendInvitation: async (_, { emails }, { user, loaders, models }) => {
      try {
        const creators = await models.Creator.findAll({ where: { email: emails } });
        const invitations = await models.Invitation.findAll({ where: { email: emails } });
        if (creators.length || invitations.length) {
          const array = [...creators, ...invitations].map(({ email }) => email);
          throw new Error(`${[...new Set(array)].join(', ')} email(s) have been already invited`);
        }
        const { id, username } = await loaders.userByUserId.load(user.attributes.sub);
        await emails.map(
          async to =>
            await sendMail({
              to,
              templateName: 'INVITATION',
              dynamicData: { to, username },
            }),
        );
        await models.Invitation.bulkCreate(emails.map(email => ({ userId: id, email })));
        return true;
      } catch (e) {
        return e;
      }
    },
    contactCreator: async (_, { mailInfo }, { user, loaders }) => {
      try {
        const fan = await loaders.userByUserId.load(user.attributes.sub);
        const product = await loaders.productById.load(mailInfo.productId);
        const creator = await loaders.userById.load(product.userId);

        try {
          await sendMail({
            to: creator.email,
            templateName: 'NEW_MESSAGE',
            dynamicData: {
              email: fan.email,
              username: fan.username,
              title: product.title,
              message: mailInfo.message,
            },
          });
          return true;
        } catch (e) {
          console.log('error sending email', e.response.body);
          return e;
        }
      } catch (e) {
        console.log('error contactCreator', e);
        return e;
      }
    },
    cancelSubscription: async (_, {}, { user, loaders, models }) => {
      try {
        const { id, email } = await loaders.userByUserId.load(user.attributes.sub);
        const res = await sendMail({
          to: SENDGRID_CC_EMAILS,
          templateName: 'CANCEL_SUBSCRIPTION',
          dynamicData: {
            email,
          },
        });
        if (res) {
          await models.Payment.update({ subscriptionCancel: true }, { where: { userId: id } });
          return true;
        }
      } catch (e) {
        return e;
      }
    },
    acceptInvitation: async (_, { email }, { models }) => {
      try {
        const exist = await models.Creator.findOne({ where: { email } });
        if (exist) {
          throw new Error('The invitation has already been accepted');
        }
        console.log(email, 'EMAIL-EMAIL-EMAIL');
        const invitation = await models.Invitation.findOne({ where: { email } });
        console.log(invitation, 'INVITATION-INVITATION');
        if (invitation) {
          await models.Creator.create({ email });
        } else {
          throw new Error('Wrong Invitation');
        }
        return true;
      } catch (e) {
        return e;
      }
    },
    updateUserImage: async (_, { image }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        await models.User.update({ image }, { where: { id } });
        return image;
      } catch (e) {
        return e;
      }
    },
  },
};

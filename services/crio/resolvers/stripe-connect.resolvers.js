const {
  createAccount,
  createAccountLink,
  createLoginLink,
  createTransfer,
  retrieveAccount,
} = require('../utils/stripe.helper');

module.exports = {
  Query: {
    getConnectAccount: async (_, {}, { user, loaders }) => {
      const { username, stripeAccountId } = await loaders.userByUserId.load(user.attributes.sub);
      if (!stripeAccountId) {
        return {};
      }
      try {
        const account = await retrieveAccount(stripeAccountId);
        return {
          charges_enabled: account?.charges_enabled,
          details_submitted: account?.details_submitted,
        };
      } catch (e) {
        console.log(`Cannot retrieve account for user ${username}`, e);
        return e;
      }
    },
    getConnectOnboardingLink: async (_, {}, { user, loaders, models }) => {
      try {
        const { id, username, email, stripeAccountId } = await loaders.userByUserId.load(
          user.attributes.sub,
        );
        let accountId = stripeAccountId;
        if (!stripeAccountId) {
          const account = await createAccount(username, email);
          accountId = account.id;
          await models.User.update({ stripeAccountId: account.id }, { where: { id } });
        }
        const { url } = await createAccountLink(accountId);
        return { url };
      } catch (e) {
        console.log(`Cannot create onboarding link for user ${username}`, e);
        return e;
      }
    },
    getConnectLoginLink: async (_, {}, { user, loaders }) => {
      const { username, stripeAccountId } = await loaders.userByUserId.load(user.attributes.sub);
      try {
        const { url } = await createLoginLink(stripeAccountId);
        return { url };
      } catch (e) {
        console.log(`Cannot get login link for user ${username}`, e);
      }
    },
    deleteStripeAccount: async (_, {}, { user, loaders, models }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      await models.User.update({ stripeAccountId: null }, { where: { id } });
      return true;
    },
  },
  Mutation: {
    createTransfers: async (_, {}, { models }) => {
      const [subscribersCount] = await models.sequelize.query(`
        SELECT COUNT(*) FROM "Payments"
        WHERE "Payments"."subscriptionStatus" = 'active'
            AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
      `);
      const [creatorsFollowersCount] = await models.sequelize.query(`
        SELECT
          "Users"."id" AS "userId",
          "Users"."stripeAccountId",
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

      const AMOUNT = 6.5;
      let totalFollowersCount = 0;
      creatorsFollowersCount.forEach(item => (totalFollowersCount += +item.followersCount));
      const price = (AMOUNT * subscribersCount[0].count * 80) / 100;
      try {
        creatorsFollowersCount.forEach(async ({ userId, followersCount, stripeAccountId }) => {
          if (followersCount > 0 && stripeAccountId) {
            const amount = (followersCount / totalFollowersCount) * price;
            const account = await retrieveAccount(stripeAccountId);
            if (account.charges_enabled) {
              const snapshot = await createTransfer(stripeAccountId, amount * 100);
              await models.Transfer.create({ userId, stripeAccountId, price: amount, snapshot });
            }
          }
        });
      } catch (e) {
        console.log('Cannot transfer', e);
      }
      return true;
    },
  },
};

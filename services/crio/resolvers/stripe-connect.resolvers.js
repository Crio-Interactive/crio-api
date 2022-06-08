const {
  createAccount,
  createAccountLink,
  createLoginLink,
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
          console.log(account.id);
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
  Mutation: {},
};

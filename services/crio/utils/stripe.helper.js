const { CLIENT_URL, STRIPE_API_KEY } = require('../config/environment');
const stripe = require('stripe')(STRIPE_API_KEY);

module.exports = {
  createAccount: (username, email) =>
    stripe.accounts.create({
      country: 'US',
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      email,
      business_type: 'individual',
      business_profile: { url: `${CLIENT_URL}profile/${username}` },
      // business_profile: { url: 'https://crio-staging.criointeractive.com/profile/narine_kosyan' },
    }),
  createAccountLink: account =>
    stripe.accountLinks.create({
      account,
      refresh_url: `${CLIENT_URL}payment?refreshUrl=true`,
      return_url: `${CLIENT_URL}payment`,
      type: 'account_onboarding',
    }),
  createLoginLink: account => stripe.accounts.createLoginLink(account),
  retrieveAccount: account => stripe.accounts.retrieve(account),
};

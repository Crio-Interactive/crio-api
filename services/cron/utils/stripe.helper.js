const { STRIPE_API_KEY } = require('../config/environment');
const stripe = require('stripe')(STRIPE_API_KEY);

module.exports = {
  retrieveAccount: account => stripe.accounts.retrieve(account),
  createTransfer: (destination, amount) =>
    stripe.transfers.create({
      amount,
      destination,
      currency: 'usd',
    }),
};

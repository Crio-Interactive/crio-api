const { CLIENT_URL, STRIPE_API_KEY } = require('../config/environment');
const stripe = require('stripe')(STRIPE_API_KEY);

module.exports = {
  createAccount: (username, email) =>
    stripe.accounts.create({
      type: 'express',
      // capabilities: {
      //   card_payments: { requested: true },
      //   transfers: { requested: true },
      // },
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
  createProduct: (userId, title, thumbnail) =>
    stripe.products.create({
      name: title,
      images: thumbnail
        ? [
            `https://crio-in-staging-bucket.s3.us-west-2.amazonaws.com/${userId}/products/thumbnail-${thumbnail}`,
          ]
        : [],
      url: `${CLIENT_URL}pricing`,
    }),
  createPrice: (id, price) =>
    stripe.prices.create({
      product: id,
      unit_amount: price * 100,
      currency: 'usd',
    }),
  createCheckoutSession: (userId, productId, priceId, stripeAccountId, fee) =>
    stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${CLIENT_URL}product/${productId}`,
      cancel_url: `${CLIENT_URL}product/${productId}`,
      metadata: { productId, userId },
      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: {
          destination: stripeAccountId,
        },
      },
    }),
};

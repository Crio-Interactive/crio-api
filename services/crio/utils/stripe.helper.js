const { BUCKET, CLIENT_URL, STRIPE_API_KEY } = require('../config/environment');
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
      // capabilities: { transfers: { requested: true } },
      // tos_acceptance: { service_agreement: 'recipient' },
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
  createProduct: (userId, title, thumbnails) =>
    stripe.products.create({
      name: title,
      images: thumbnails
        ? thumbnails.map(
            thumbnail =>
              `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${userId}/products/thumbnail-${thumbnail}`,
          )
        : [],
      url: `${CLIENT_URL}pricing`,
    }),
  createPrice: (id, price) =>
    stripe.prices.create({
      product: id,
      unit_amount: (price * 100).toFixed(),
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
      success_url: `${CLIENT_URL}product/${productId}?show_banner=true`,
      cancel_url: `${CLIENT_URL}product/${productId}`,
      metadata: { productId, userId },
      payment_intent_data: {
        application_fee_amount: parseInt(fee),
        transfer_data: {
          destination: stripeAccountId,
        },
      },
    }),
  createTransfer: (destination, amount) =>
    stripe.transfers.create({
      amount,
      destination,
      currency: 'usd',
    }),
};

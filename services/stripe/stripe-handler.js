require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
var cors = require('cors');

const { CLIENT_URL, STRIPE_API_KEY } = require('./config/environment');
const { getProduct, handler } = require('./handler');
const stripe = require('stripe')(STRIPE_API_KEY);

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  try {
    const result = await handler(request.headers, JSON.stringify(request.body));
    response.json(result);
  } catch (e) {
    response.status(400).send(e);
  }
});

app.post('/create-checkout-session', async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return;
  }
  const product = await getProduct(productId);
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
  });

  res.json({ url: session.url });
  // res.redirect(303, session.url);
});

app.listen(5050, () => console.log('Stripe server running on port 5050'));

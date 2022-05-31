require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
var cors = require('cors');
const { getProduct, handler } = require('./handler');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

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
  console.log(req.params);
  const x = await getProduct(29);
  console.log(x, 4444);
  return;
  const product = await stripe.products.create({
    name: 'SUCCESS',
    images: [
      'https://crio-in-staging-bucket.s3.us-west-2.amazonaws.com/43/products/thumbnail-1653891364603',
    ],
    url: 'http://localhost:3000/product/29',
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 2000,
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
    success_url: `http://localhost:3000/product/29`,
    cancel_url: `http://localhost:3000/product/29`,
  });

  res.json({ url: session.url });
  // res.redirect(303, session.url);
});

app.listen(5050, () => console.log('Stripe server running on port 5050'));

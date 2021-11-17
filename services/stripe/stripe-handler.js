// server.js
//
// Use this sample code to handle webhook events in your integration.
//
// 1) Paste this code into a new file (server.js)
//
// 2) Install dependencies
//   npm install stripe
//   npm install express
//
// 3) Run the server on http://localhost:4242
//   node server.js

const stripeHandler = require('stripe');
const express = require('express');
const app = express();

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_PGQeQjomSZvS3Dnqzo03dZEsLW8l5u7D";

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripeHandler.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      // Then define and call a function to handle the event customer.subscription.updated
      break;
    case 'invoice.paid':
      // const invoice = event.data.object;
      // Then define and call a function to handle the event invoice.paid
      break;
    case 'invoice.payment_failed':
      // const invoice = event.data.object;
      // Then define and call a function to handle the event invoice.payment_failed
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.listen(4242, () => console.log('Running on port 4242'));

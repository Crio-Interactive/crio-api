require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const handler = require('./handler');

const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  try {
    const result = await handler(request.headers, JSON.stringify(request.body));
    response.json(result);
  } catch(e) {
    response.status(400).send(e);
  }
});

app.listen(5050, () => console.log('Stripe server running on port 5050'));

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const variables = {
  VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
  VIMEO_API_URL: 'https://api.vimeo.com',
  STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  DB_HOST: process.env.DB_HOST,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
};

module.exports = variables;

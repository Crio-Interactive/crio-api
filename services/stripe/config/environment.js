const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const variables = {
  VIMEO_ACCESS_TOKEN: process.env.VIMEO_ACCESS_TOKEN,
  VIMEO_API_URL: 'https://api.vimeo.com',
  DB_HOST: process.env.DB_HOST,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_VERIFIED_SENDER: process.env.SENDGRID_VERIFIED_SENDER,
  SENDGRID_CC_EMAILS: process.env.SENDGRID_CC_EMAILS,
};

module.exports = variables;

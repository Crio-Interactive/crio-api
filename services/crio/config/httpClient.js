const axios = require('axios');
const { VIMEO_ACCESS_TOKEN, VIMEO_API_URL } = require('./environment');

const authToken = `bearer ${VIMEO_ACCESS_TOKEN}`;
const headers = {
  Authorization: authToken,
  'Content-Type': 'application/json',
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
  'Tus-Resumable': '1.0.0',
};

const vimeoClient = axios.create({
  baseURL: VIMEO_API_URL,
  headers,
});

module.exports = {
  vimeoClient,
};


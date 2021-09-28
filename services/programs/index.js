require('dotenv').config({ path: __dirname + '/.env' });
const { runLocal } = require('@tidepoollabs/node-programs-service');

runLocal();

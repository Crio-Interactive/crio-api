require('dotenv').config({ path: __dirname + '/.env' });
const { runLocal } = require('@tidepoollabs/node-manage-users-service');

runLocal();

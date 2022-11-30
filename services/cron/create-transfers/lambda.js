const logs = require('@tidepoollabs/node-lambda-logs');
const handler = require('./index');

logs.init(process.env.SENTRY_DSN);


exports.handler = logs.wrapHandler(handler);

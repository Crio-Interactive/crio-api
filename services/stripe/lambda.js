const path = require('path');
const AWS = require('aws-sdk');
const logs = require('@tidepoollabs/node-lambda-logs');
const handler = require('./handler');
const { formatResponse, formatError } = require('./utils');

logs.init(process.env.SENTRY_DSN);
const lambda = new AWS.Lambda();

exports.handler = logs.wrapHandler(
  async function (request, context) {
    // console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
    // console.log('## CONTEXT: ' + serialize(context));
    console.log('## WebHook Event: ----> \n' + request);
    try {
      if (request.httpMethod === 'POST') {
        const result = await handler(request.headers, request.body);
        return formatResponse(result);
      } else {
        return Promise.reject({
          statusCode: 403,
          code: 403,
          message: 'Method is not allowed',
        });
      }
    } catch (error) {
      return formatError(error);
    }
  },
  { captureTimeoutWarning: false },
);

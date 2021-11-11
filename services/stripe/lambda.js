const logs = require('@tidepoollabs/node-lambda-logs');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

logs.init(process.env.SENTRY_DSN);

exports.handler = logs.wrapHandler(async function(event, context) {
  console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
  console.log('## CONTEXT: ' + serialize(context));
  console.log('## EVENT: ' + serialize(event));
  try {
    let accountSettings = await getAccountSettings();
    return formatResponse(serialize(accountSettings.AccountUsage));
  } catch (error) {
    return formatError(error);
  }
}, { captureTimeoutWarning: false });

function formatResponse(body) {
  const response = {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json',
    },
    'isBase64Encoded': false,
    'body': body,
  };
  return response;
};

function formatError(error) {
  const response = {
    'statusCode': error.statusCode,
    'headers': {
      'Content-Type': 'text/plain',
      'x-amzn-ErrorType': error.code,
    },
    'isBase64Encoded': false,
    'body': error.code + ': ' + error.message,
  };
  return response;
}

// Use SDK client
function getAccountSettings() {
  return lambda.getAccountSettings().promise();
}

function serialize(object) {
  return JSON.stringify(object, null, 2);
}

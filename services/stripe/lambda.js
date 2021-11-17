const logs = require('@tidepoollabs/node-lambda-logs');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

logs.init(process.env.SENTRY_DSN);

exports.handler = logs.wrapHandler(async function(event, context) {
  // console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
  // console.log('## CONTEXT: ' + serialize(context));
  console.log('## WebHook Event: ----> \n' + event);
  try {
    console.log('event', event);
    console.log('context', context);
    return formatResponse(true);
  } catch (error) {
    return formatError(error);
  }
}, { captureTimeoutWarning: false });

function formatResponse(body) {
  return {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json',
    },
    'isBase64Encoded': false,
    'body': body,
  };
}

function formatError(error) {
  return  {
    'statusCode': error.statusCode,
    'headers': {
      'Content-Type': 'text/plain',
      'x-amzn-ErrorType': error.code,
    },
    'isBase64Encoded': false,
    'body': error.code + ': ' + error.message,
  };
}

// Use SDK client
function getAccountSettings() {
  return lambda.getAccountSettings().promise();
}

function serialize(object) {
  return JSON.stringify(object, null, 2);
}

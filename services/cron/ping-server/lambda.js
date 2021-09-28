const Lambda = require('aws-sdk/clients/lambda');
const logs = require('@tidepoollabs/node-lambda-logs');
logs.init(process.env.SENTRY_DSN);

const lambda = new Lambda();

const checkHealth = functionName => {
  const event = {
    headers: {},
    path: '/graphql/.well-known/apollo/server-health',
    httpMethod: 'GET',
    isBase64Encoded: true,
    pathParameters: {
      proxy: '/graphql',
    },
    requestContext: {
      accountId: 'dummy',
    },
  };
  return lambda
    .invoke({
      FunctionName: functionName,
      Payload: JSON.stringify(event, null, 2), // pass params
    })
    .promise();
};

// WarmUP lambda functions
const handler = async () => {
  const lambdaFunctions = process.env.PING_FUNCTION_NAMES.split(',');
  try {
    await Promise.all(lambdaFunctions.map(checkHealth));
    console.log('Successfully invoked all functions');
  } catch (e) {
    console.error('Error invoking functions', e);
  }
};
exports.handler = logs.wrapHandler(handler);

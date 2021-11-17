const logs = require('@tidepoollabs/node-lambda-logs');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();
const stripe = require('stripe');

logs.init(process.env.SENTRY_DSN);
const stripeSecret = process.env.STRIPE_HOOK_SECRET_TEST;

exports.handler = logs.wrapHandler(async function(request, context) {
  // console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env));
  // console.log('## CONTEXT: ' + serialize(context));
  console.log('## WebHook Event: ----> \n' + request);
  try {
    if (request.httpMethod === 'POST') {
      const sig = request.headers['Stripe-Signature'];
      let event;
      try {
        event = stripe.webhooks.constructEvent(request.body, sig, stripeSecret);
      } catch (err) {
        return formatError({
          statusCode: 400,
          code: 400,
          message: `Webhook Error: ${err.message}`,
        })
      }

      switch(event.type) {
        case 'customer.subscription.updated': {
          const subscription = event.data.object;
          console.log('subscription ===>>', subscription);
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object;
          console.log('invoice.paid =====>>', invoice);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          console.log('invoice.failed =====>>', invoice);
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    }
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

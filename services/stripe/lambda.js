const logs = require('@tidepoollabs/node-lambda-logs');
const AWS = require('aws-sdk');
const stripe = require('stripe');
const DB = require('./models');

logs.init(process.env.SENTRY_DSN);
const lambda = new AWS.Lambda();
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
          const user = await DB.User.findOne({
            where: {
              email: subscription.customer_email,
            }
          });
          if (user) {
            const paymentDetails = await DB.Payment.findOne({
              userId: user.id
            });
            if (paymentDetails) {
              await DB.Payment.update({
                subscriptionStatus: subscription.status,
              }, {
                where: {
                  id: paymentDetails.id,
                }
              });
            }
          }
          break;
        }
        case 'invoice.paid': {
          const invoice = event.data.object
          const periodStartDate = new Date(invoice.period_start * 1000);
          const periodEndDate = new Date(invoice.period_end * 1000);
          const paymentDetails = await DB.Payment.findOne({
            where: {
              customerEmail: invoice.customer_email,
            }
          });
          if (paymentDetails) {
            await DB.Payment.update({
              periodStart: periodStartDate,
              periodEnd: periodEndDate,
              subscriptionStatus: 'active',
              lastEventSnapshot: invoice,
            });
          } else {
            const user = await DB.User.findOne({
              email: invoice.customer_email,
            });
            if (user) {
              await DB.Payment.create({
                userId: user.id,
                customerEmail: user.email,
                periodStart: periodStartDate,
                periodEnd: periodEndDate,
                subscriptionStatus: 'active',
                lastEventSnapshot: invoice,
              });
            }
          }
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          const paymentDetails = await DB.Payment.findOne({
            where: {
              customerEmail: invoice.customer_email,
            }
          });
          if (paymentDetails) {
            await DB.Payment.update({
              subscriptionStatus: 'unpaid',
              lastEventSnapshot: invoice,
            });
          }
          console.log('invoice.failed =====>>', invoice);
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } else {
      await Promise.reject({
        statusCode: 403,
        code: 403,
        message: 'Method is not allowed',
      });
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

function serialize(object) {
  return JSON.stringify(object, null, 2);
}

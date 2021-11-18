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

const subscribeObject = {
  id: 'sub_00000000000000',
  object: 'subscription',
  application_fee_percent: null,
  automatic_tax: { enabled: false },
  billing_cycle_anchor: 1637160154,
  billing_thresholds: null,
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  collection_method: 'charge_automatically',
  created: 1637160154,
  current_period_end: 1639752154,
  current_period_start: 1637160154,
  customer: 'cus_00000000000000',
  days_until_due: null,
  default_payment_method: 'pm_1JwpLJK5TIczT4Jn0JcTcDZd',
  default_source: null,
  default_tax_rates: [],
  discount: null,
  ended_at: null,
  items: {
    object: 'list',
    data: [ [Object] ],
    has_more: false,
    url: '/v1/subscription_items?subscription=sub_1JwpLKK5TIczT4JnwXsjXlWZ'
  },
  latest_invoice: 'in_1JwpLKK5TIczT4Jnc1OEVzhM',
  livemode: false,
  metadata: {},
  next_pending_invoice_item_invoice: null,
  pause_collection: null,
  payment_settings: { payment_method_options: null, payment_method_types: null },
  pending_invoice_item_interval: null,
  pending_setup_intent: null,
  pending_update: null,
  schedule: null,
  start_date: 1637160154,
  status: 'active',
  transfer_data: null,
  trial_end: null,
  trial_start: null
};

const invoicePaid = {
  id: 'in_00000000000000',
  object: 'invoice',
  account_country: 'US',
  account_name: 'Crio Interactive',
  account_tax_ids: null,
  amount_due: 399,
  amount_paid: 0,
  amount_remaining: 399,
  application_fee_amount: null,
  attempt_count: 0,
  attempted: true,
  auto_advance: true,
  automatic_tax: { enabled: false, status: null },
  billing_reason: 'manual',
  charge: '_00000000000000',
  collection_method: 'charge_automatically',
  created: 1637164439,
  currency: 'usd',
  custom_fields: null,
  customer: 'cus_00000000000000',
  customer_address: {
    city: null,
    country: 'AM',
    line1: null,
    line2: null,
    postal_code: null,
    state: null
  },
  customer_email: 'van@tidepoollabs.com',
  customer_name: 'Van Tigranyan',
  customer_phone: null,
  customer_shipping: null,
  customer_tax_exempt: 'none',
  customer_tax_ids: [],
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  discounts: [],
  due_date: null,
  ending_balance: null,
  footer: null,
  hosted_invoice_url: null,
  invoice_pdf: null,
  last_finalization_error: null,
  lines: {
    object: 'list',
    data: [ [Object] ],
    has_more: false,
    url: '/v1/invoices/in_1JwqSRK5TIczT4JncRJYMyWu/lines'
  },
  livemode: false,
  metadata: {},
  next_payment_attempt: 1637168039,
  number: null,
  on_behalf_of: null,
  paid: true,
  payment_intent: null,
  payment_settings: { payment_method_options: null, payment_method_types: null },
  period_end: 1639752154,
  period_start: 1637160154,
  post_payment_credit_notes_amount: 0,
  pre_payment_credit_notes_amount: 0,
  quote: null,
  receipt_number: null,
  starting_balance: 0,
  statement_descriptor: null,
  status: 'draft',
  status_transitions: {
    finalized_at: null,
    marked_uncollectible_at: null,
    paid_at: null,
    voided_at: null
  },
  subscription: null,
  subtotal: 399,
  tax: null,
  total: 399,
  total_discount_amounts: [],
  total_tax_amounts: [],
  transfer_data: null,
  webhooks_delivered_at: null,
  closed: true
};

const invoiceRejected = {
  id: 'in_00000000000000',
  object: 'invoice',
  account_country: 'US',
  account_name: 'Crio Interactive',
  account_tax_ids: null,
  amount_due: 399,
  amount_paid: 0,
  amount_remaining: 399,
  application_fee_amount: null,
  attempt_count: 0,
  attempted: true,
  auto_advance: true,
  automatic_tax: { enabled: false, status: null },
  billing_reason: 'manual',
  charge: null,
  collection_method: 'charge_automatically',
  created: 1637164782,
  currency: 'usd',
  custom_fields: null,
  customer: 'cus_00000000000000',
  customer_address: {
    city: null,
    country: 'AM',
    line1: null,
    line2: null,
    postal_code: null,
    state: null
  },
  customer_email: 'van@tidepoollabs.com',
  customer_name: 'Van Tigranyan',
  customer_phone: null,
  customer_shipping: null,
  customer_tax_exempt: 'none',
  customer_tax_ids: [],
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  discounts: [],
  due_date: null,
  ending_balance: null,
  footer: null,
  hosted_invoice_url: null,
  invoice_pdf: null,
  last_finalization_error: null,
  lines: {
    object: 'list',
    data: [ [Object] ],
    has_more: false,
    url: '/v1/invoices/in_1JwqXyK5TIczT4JnyBtITCh3/lines'
  },
  livemode: false,
  metadata: {},
  next_payment_attempt: 1637168382,
  number: null,
  on_behalf_of: null,
  paid: false,
  payment_intent: null,
  payment_settings: { payment_method_options: null, payment_method_types: null },
  period_end: 1639752154,
  period_start: 1637160154,
  post_payment_credit_notes_amount: 0,
  pre_payment_credit_notes_amount: 0,
  quote: null,
  receipt_number: null,
  starting_balance: 0,
  statement_descriptor: null,
  status: 'draft',
  status_transitions: {
    finalized_at: null,
    marked_uncollectible_at: null,
    paid_at: null,
    voided_at: null
  },
  subscription: null,
  subtotal: 399,
  tax: null,
  total: 399,
  total_discount_amounts: [],
  total_tax_amounts: [],
  transfer_data: null,
  webhooks_delivered_at: null,
  closed: false
};

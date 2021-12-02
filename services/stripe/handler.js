const fromUnixTime = require('date-fns/fromUnixTime');
const { addUnixTimeMonth } = require('./utils');
const DB = require('./models');

const createOrUpdateVoucher = async ({ userId, ...params }) => {
  const voucher = await DB.Voucher.findOne({
    where: {
      userId,
    }
  });
  console.log('foundVoucher', voucher);
  if (voucher) {
    for (const key of Object.keys(params)) {
      voucher[key] = params[key];
    }
    return voucher.save();
  } else {
    return DB.Voucher.create({
      userId,
      ...params,
    });
  }
};

const handler = async (headers, body) => {
  try {
    const event = typeof body === 'string' ? JSON.parse(body) : body;

    switch (event.type) {
      case 'invoice.paid': {
        const invoice = event.data.object;
        const periodDetails = invoice.lines?.data?.[0].period;
        const startDateStamp = periodDetails?.start || invoice.period_start;
        const endDateStamp = periodDetails?.end || addUnixTimeMonth(invoice.period_start, 1);
        console.log('invoice', invoice);
        console.log('periodDetails', periodDetails);
        console.log('startDateStamp', startDateStamp);
        console.log('endDateStamp', endDateStamp);

        const periodStartDate = fromUnixTime(startDateStamp);
        const periodEndDate = fromUnixTime(endDateStamp);

        console.log('periods', periodStartDate, periodEndDate);

        let paymentDetails = await DB.Payment.findOne({
          where: {
            customerEmail: invoice.customer_email,
          },
        });
        console.log('paymentDetails', paymentDetails);
        if (paymentDetails) {
          await DB.Payment.update({
            periodStart: periodStartDate,
            periodEnd: periodEndDate,
            subscriptionStatus: 'active',
            lastEventSnapshot: invoice,
          }, {
            where: {
              customerEmail: invoice.customer_email,
            },
          });
          console.log('payment updated');
        } else {
          const user = await DB.User.findOne({
            where: {
              email: invoice.customer_email,
            },
          });
          console.log('user ===>', user);
          if (user) {
            paymentDetails = await DB.Payment.create({
              userId: user.id,
              customerEmail: user.email,
              periodStart: periodStartDate,
              periodEnd: periodEndDate,
              subscriptionStatus: 'active',
              lastEventSnapshot: invoice,
            });
            console.log('created-paymentDetails', paymentDetails);
          }
        }
        if (paymentDetails) {
          await createOrUpdateVoucher({
            userId: paymentDetails.userId,
            tier1: 5,
            tier2: 5,
            tier3: 5,
          });
          console.log('voucher updated');
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const paymentDetails = await DB.Payment.findOne({
          where: {
            customerEmail: invoice.customer_email,
          },
        });
        if (paymentDetails) {
          await DB.Payment.update({
            subscriptionStatus: 'unpaid',
            lastEventSnapshot: invoice,
          }, {
            where: {
              customerEmail: invoice.customer_email,
            },
          });
          await createOrUpdateVoucher({
            userId: paymentDetails.userId,
            tier1: 0,
            tier2: 0,
            tier3: 0,
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return true;
  } catch (error) {
    console.log('err', error);
    return Promise.reject(error);
  }
};

module.exports = handler;

const fromUnixTime = require('date-fns/fromUnixTime');

const { BUCKET } = require('./config/environment');
const sendMail = require('./config/mail');
const { addUnixTimeMonth } = require('./utils');
const DB = require('./models');

const createProductCustomer = async attributes => {
  const productId = attributes.metadata.productId;
  // const transaction = await DB.sequelize.transaction();
  try {
    const product = await DB.Product.findOne({
      raw: true,
      where: { id: productId },
      attributes: [
        'User.username',
        'User.email',
        'userId',
        'productTypeId',
        'limit',
        'title',
        'file',
      ],
      include: {
        attributes: [],
        model: DB.User,
      },
    });
    DB.ProductCustomer.create(
      {
        userId: attributes.metadata.userId,
        productId,
        customerEmail: attributes.customer_details.email,
        customerName: attributes.customer_details.name,
        status: attributes.status,
        eventSnapshot: attributes,
      },
      // { transaction },
    );
    if (product.limit > 0) {
      await DB.Product.update({ limit: product.limit - 1 }, { where: { id: productId } });
    }
    await sendMail({
      to: attributes.customer_details.email,
      sender: product.username,
      replyTo: product.email,
      templateName: 'DOWNLOAD',
      dynamicData: {
        title: product.title,
        url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${product.userId}/products/file-${product.file}`,
      },
    });
    await sendMail({
      to: product.email,
      sender: product.username,
      replyTo: attributes.customer_details.email,
      templateName: 'PURCHASE',
      dynamicData: {
        title: product.title,
        email: attributes.customer_details.email,
        isService: +product.productTypeId === 1,
      },
    });
    // await transaction.commit();
  } catch (e) {
    // await transaction.rollback();
    console.log(e, 'Can not create customer');
  }
};

const handler = async (headers, body) => {
  try {
    const event = typeof body === 'string' ? JSON.parse(body) : body;

    console.log(event.type, 'event.type');

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
          await DB.Payment.update(
            {
              periodStart: periodStartDate,
              periodEnd: periodEndDate,
              subscriptionStatus: 'active',
              lastEventSnapshot: invoice,
              subscriptionCancel: false,
            },
            {
              where: {
                customerEmail: invoice.customer_email,
              },
            },
          );
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
          await DB.Payment.update(
            {
              subscriptionStatus: 'unpaid',
              lastEventSnapshot: invoice,
            },
            {
              where: {
                customerEmail: invoice.customer_email,
              },
            },
          );
        }
        break;
      }
      case 'checkout.session.completed': {
        await createProductCustomer(event.data.object);
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

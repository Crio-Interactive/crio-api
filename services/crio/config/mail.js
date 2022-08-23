const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY } = require('./environment');
const { from, templates } = require('../constants/send-grid');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ to, cc, templateName, dynamicData = {} }) => {
  sgMail.send({
    to,
    from,
    cc,
    templateId: templates[templateName],
    dynamic_template_data: dynamicData,
  });
};

module.exports = sendMail;

// const sendMail = async ({ to, subject, text, cc }) =>
//   sgMail.send({
//     to,
//     from: SENDGRID_VERIFIED_SENDER,
//     subject,
//     text,
//     cc: [SENDGRID_CC_EMAILS, cc].filter(email => email !== to),
//   });

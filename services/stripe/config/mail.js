const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY } = require('./environment');
const { from, templates } = require('../constants/send-grid');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ to, replyTo, sender, cc, templateName, dynamicData = {} }) => {
  sgMail.send({
    to,
    from: sender ? { ...from, name: `Creator ${sender} via Crio` } : from,
    replyTo,
    cc,
    templateId: templates[templateName],
    dynamic_template_data: dynamicData,
  });
};

module.exports = sendMail;

// const sendMail = async ({ sender, replyTo, to, subject, text, cc }) =>
//   sgMail.send({
//     to,
//     from: sender
//       ? { name: `Creator ${sender} via Crio`, email: SENDGRID_VERIFIED_SENDER }
//       : SENDGRID_VERIFIED_SENDER,
//     replyTo,
//     subject,
//     text,
//     cc: [cc].filter(email => email !== to),
//   });

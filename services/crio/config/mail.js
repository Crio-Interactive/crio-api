const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY, SENDGRID_VERIFIED_SENDER, SENDGRID_CC_EMAILS } = require('./environment');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ to, subject, text, cc }) => {
  return sgMail.send({
    to,
    from: SENDGRID_VERIFIED_SENDER,
    subject,
    text,
    cc: [SENDGRID_CC_EMAILS, cc].filter(email => (email !== to)),
  });
};

module.exports = sendMail;

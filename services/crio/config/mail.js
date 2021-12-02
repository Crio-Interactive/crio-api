const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY, SENDGRID_VERIFIED_SENDER, SENDGRID_CC_EMAILS } = require('./environment');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ to, subject, text, cc }) => {
  console.log('SENDGRID_API_KEY', SENDGRID_API_KEY);
  return sgMail.send({
    to,
    from: SENDGRID_VERIFIED_SENDER,
    subject,
    text,
    cc: [SENDGRID_CC_EMAILS, cc],
  });
};

module.exports = sendMail;

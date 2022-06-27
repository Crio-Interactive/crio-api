const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY, SENDGRID_CC_EMAILS, SENDGRID_VERIFIED_SENDER } = require('./environment');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ sender, to, subject, text, cc }) =>
  sgMail.send({
    to,
    from: sender
      ? { name: `Creator ${sender} via Crio`, email: SENDGRID_VERIFIED_SENDER }
      : SENDGRID_VERIFIED_SENDER,
    subject,
    text,
    cc: [SENDGRID_CC_EMAILS, cc].filter(email => email !== to),
  });

module.exports = sendMail;

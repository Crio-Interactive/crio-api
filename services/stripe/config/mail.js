const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY, SENDGRID_VERIFIED_SENDER } = require('./environment');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ sender, replyTo, to, subject, text, cc }) =>
  sgMail.send({
    to,
    from: sender
      ? { name: `Creator ${sender} via Crio`, email: SENDGRID_VERIFIED_SENDER }
      : SENDGRID_VERIFIED_SENDER,
    replyTo,
    subject,
    text,
    cc: [cc].filter(email => email !== to),
  });

module.exports = sendMail;

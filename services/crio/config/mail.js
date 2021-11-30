const sgMail = require('@sendgrid/mail');

const { SENDGRID_API_KEY } = require('./environment');

sgMail.setApiKey(SENDGRID_API_KEY);

const sendMail = async ({ to, from, subject, text }) => {
  return sgMail.send({
    to,
    from,
    subject,
    text,
  });
};

module.exports = sendMail;

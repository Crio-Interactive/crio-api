const {
  SENDGRID_TEMPLATE_DOWNLOAD,
  SENDGRID_TEMPLATE_PURCHASE,
  SENDGRID_VERIFIED_SENDER,
} = require('../config/environment');

const from = {
  email: SENDGRID_VERIFIED_SENDER,
  name: 'Crio Team',
};

const templates = {
  DOWNLOAD: SENDGRID_TEMPLATE_DOWNLOAD,
  PURCHASE: SENDGRID_TEMPLATE_PURCHASE,
};

module.exports = {
  from,
  templates,
};

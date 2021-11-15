const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const logs = require('@tidepoollabs/node-lambda-logs');
const sequelize = require('sequelize');
const { vimeoClient } = require('../config/httpClient');

logs.init(process.env.SENTRY_DSN);

const handler = async () => {
  try {
    console.log('models', sequelize.models);
    const { Artwork } = sequelize.models;
    const videosToCheck = await Artwork.findAll({
      where: {
        status: {
          [sequelize.Op.not]: 'available',
        }
      },
      limit: 10,
    });
    if (videosToCheck.length) {
      const requests = videosToCheck.map((vid) => vimeoClient.get(vid.videoUri));
      const results = await Promise.all(requests);
      const available = results.filter(res => res.data.status.available).map(itm => itm.data.uri);
      if (available.length) {
        await Artwork.update({
          status: 'available',
        }, {
          where: {
            videoUri: available,
          },
        });
      }
    }
    console.log('Successfully updated video statuses');
  } catch (e) {
    console.error('Error checking videos statuses', e);
  }
};
exports.handler = logs.wrapHandler(handler);

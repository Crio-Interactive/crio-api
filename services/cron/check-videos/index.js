const path = require('path');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const { vimeoClient } = require('../config/httpClient');
const db = require('../models');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const handler = async () => {
  try {
    const { Artwork } = db;
    const videosToCheck = await Artwork.findAll({
      where: {
        status: {
          [Op.not]: 'available',
        }
      },
      limit: 10,
    });
    if (videosToCheck.length) {
      const requests = videosToCheck.map((vid) => vimeoClient.get(vid.videoUri));
      const results = await Promise.all(requests);
      console.log('results', results);
      const available = results.filter(res => res.data.status.available).map(itm => itm.data.uri);
      if (available.length) {
        const res = await Artwork.update({
          status: 'available',
        }, {
          where: {
            videoUri: available,
          },
        });
        console.log('res', res);
      }
    }
    console.log('Successfully updated video statuses');
  } catch (e) {
    console.error('Error checking videos statuses', e);
  }
};

module.exports = handler;

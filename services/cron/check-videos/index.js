const path = require('path');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const { vimeoClient } = require('../config/httpClient');
const db = require('../models');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const checkStatus = async () => {
  try {
    const { Artwork } = db;
    const videosToCheck = await Artwork.findAll({
      where: {
        [Op.or]: [
          {
            status: {
              [Op.not]: 'available',
            },
          },
          {
            thumbnail: {
              [Op.like]: `%/default%`,
            },
          },
        ],
      },
      limit: 10,
    });
    if (videosToCheck.length) {
      const requests = videosToCheck.map(vid => vimeoClient.get(vid.videoUri));
      const results = await Promise.all(requests);
      console.log('results', results);
      const available = results.filter(res => res.data.status === 'available');
      if (available.length) {
        const dbQueries = available.map(itm => {
          return Artwork.update(
            {
              status: 'available',
              thumbnail: itm.data.pictures.base_link,
            },
            {
              where: {
                content: itm.data.uri,
              },
            },
          );
        });
        const res = await Promise.all(dbQueries);
        console.log('res', res);
      }
    }
    console.log('Successfully updated video statuses');
  } catch (e) {
    console.error('Error checking videos statuses', e);
  }
};

const handler = async () => {
  try {
    await checkStatus();
  } catch (e) {
    console.error('Error checking videos statuses', e);
  }
};

module.exports = handler;

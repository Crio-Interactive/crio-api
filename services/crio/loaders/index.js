// https://github.com/graphql/dataloader
const DataLoader = require('dataloader');

const loaders = (models, user) => {
  const self = {
    userById: new DataLoader(ids =>
      models.User.findAll({
        where: {
          id: ids,
        },
      }).then(users => ids.map(id => users.find(user => user.id == id))),
    ),
    userByUserId: new DataLoader(userIds =>
      models.User.findAll({
        where: {
          userId: userIds,
        },
      }).then(users => userIds.map(userId => users.find(user => user.userId == userId))),
    ),
    userByUsername: new DataLoader(usernames =>
      models.User.findAll({
        where: {
          username: usernames,
        },
      }).then(users => usernames.map(username => users.find(user => user.username == username))),
    ),
    isCreator: new DataLoader(emails =>
      models.Creator.findAll({ where: { email: emails } }).then(users =>
        emails.map(email => !!users.find(user => user.email == email)),
      ),
    ),
    isFollowing: new DataLoader(async followingIds => {
      const { id } = await self.userByUserId.load(user.attributes.sub);
      return models.Following.findAll({ where: { userId: id, followingId: followingIds } }).then(
        followings =>
          followingIds.map(
            followingId => !!followings.find(following => following.followingId == followingId),
          ),
      );
    }),
    artworkById: new DataLoader(ids =>
      models.Artwork.findAll({
        raw: true,
        order: [['updatedAt', 'DESC']],
        attributes: [
          'id',
          ['id', 'artworkId'],
          'userId',
          'videoUri',
          'pictures_uri',
          'thumbnailUri',
          'title',
          'description',
          'accessibility',
          'status',
          'User.providerType',
          'User.providerUserId',
          'User.avatar',
          [models.sequelize.Sequelize.col('username'), 'name'],
        ],
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          id: ids,
        },
      }).then(artworks => ids.map(id => artworks.find(artwork => artwork.id == id))),
    ),
    artworksByUserId: new DataLoader(async userIds =>
      models.Artwork.findAll({
        raw: true,
        order: [['updatedAt', 'DESC']],
        attributes: [
          'id',
          ['id', 'artworkId'],
          'userId',
          'videoUri',
          'thumbnailUri',
          'title',
          'description',
          'accessibility',
          'status',
          'User.providerType',
          'User.providerUserId',
          'User.avatar',
          [models.sequelize.Sequelize.col('username'), 'name'],
        ],
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          userId: userIds,
        },
      }).then(artworks =>
        userIds.map(userId => artworks.filter(artwork => artwork.userId == userId)),
      ),
    ),
    productsByUserId: new DataLoader(async userIds =>
      models.Product.findAll({
        raw: true,
        order: [['updatedAt', 'DESC']],
        attributes: [
          'id',
          ['id', 'productId'],
          'userId',
          'User.providerType',
          'User.providerUserId',
          'User.avatar',
          'type',
          'title',
          'description',
          'price',
          'limit',
          'accessibility',
          'thumbnail',
          [models.sequelize.Sequelize.col('username'), 'name'],
        ],
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          userId: userIds,
        },
      }).then(artworks =>
        userIds.map(userId => artworks.filter(artwork => artwork.userId == userId)),
      ),
    ),
  };
  return self;
};

module.exports = loaders;

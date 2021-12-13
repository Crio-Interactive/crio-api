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
    artworkById: new DataLoader(async artworkIds => {
      const result = await models.Artwork.findAll({
        where: {
          id: artworkIds,
        },
      });

      const map = result.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      return artworkIds.map(id => map[id]);
    }),
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
          'status',
          'User.providerType',
          'User.providerUserId',
          [models.sequelize.literal(`
            CASE WHEN \'name\'= ANY("User"."visibility") THEN CONCAT("User"."firstName", \' \', "User"."lastName")
                 WHEN \'username\'= ANY("User"."visibility") THEN "username"
                 ELSE "User"."email" END`), 'name'],
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

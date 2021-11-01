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
      return models.Following.findAll({ where: { userId: id, followingId: followingIds } }).then(followings =>
        followingIds.map(followingId => !!followings.find(following => following.followingId == followingId)),
      );
    }),
    followingsByUserId: new DataLoader(userIds =>
      models.Following.findAll({
        raw: true,
        attributes: ['User.id', 'userId', 'User.firstName', 'User.lastName', 'User.username'],
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          userId: userIds,
        },
      }).then(followings => userIds.map(userId => followings.find(user => user.userId == userId))),
    ),
  };
  return self;
};

module.exports = loaders;

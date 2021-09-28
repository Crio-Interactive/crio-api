// https://github.com/graphql/dataloader
const DataLoader = require('dataloader');

const loaders = models => {
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
      }).then(users =>
        userIds.map(userId => users.find(user => user.userId == userId)),
      ),
    ),
  };
  return self;
};

module.exports = loaders;

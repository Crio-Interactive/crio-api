// https://github.com/graphql/dataloader
const DataLoader = require('dataloader');

const attributes = [
  'userId',
  'User.username',
  'User.providerType',
  'User.providerUserId',
  'User.avatar',
  'title',
  'description',
  'accessibility',
];

const artworkAttributes = [
  ...attributes,
  ['id', 'artworkId'],
  'categoryId',
  'status',
  'content',
  'pictures_uri',
  'thumbnail',
];

const productAttributes = [
  ...attributes,
  ['id', 'productId'],
  'categoryId',
  'price',
  'limit',
  'thumbnail',
  'file',
];

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
        attributes: artworkAttributes,
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          id: ids,
        },
      }).then(artworks => ids.map(id => artworks.find(artwork => artwork.artworkId == id))),
    ),
    artworksByUserId: new DataLoader(async userIds =>
      models.Artwork.findAll({
        raw: true,
        order: [['id', 'DESC']],
        attributes: artworkAttributes,
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
    artworkLikesById: new DataLoader(ids =>
      models.ArtworkLike.findAll({
        raw: true,
        attributes: ['userId', 'artworkId'],
        where: {
          artworkId: ids,
        },
        logging: true,
      }).then(artworkLikes =>
        ids.map(id => artworkLikes.filter(artworkLike => artworkLike.artworkId == id)),
      ),
    ),
    productById: new DataLoader(ids =>
      models.Product.findAll({
        raw: true,
        order: [['updatedAt', 'DESC']],
        attributes: productAttributes,
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          id: ids,
        },
      }).then(products => ids.map(id => products.find(product => product.productId == id))),
    ),
    productsByUserId: new DataLoader(async userIds =>
      models.Product.findAll({
        raw: true,
        order: [['id', 'DESC']],
        attributes: productAttributes,
        include: {
          attributes: [],
          model: models.User,
        },
        where: {
          userId: userIds,
        },
      }).then(products =>
        userIds.map(userId => products.filter(product => product.userId == userId)),
      ),
    ),
    productLikesById: new DataLoader(ids =>
      models.ProductLike.findAll({
        raw: true,
        attributes: ['userId', 'productId'],
        where: {
          productId: ids,
        },
      }).then(productLikes =>
        ids.map(id => productLikes.filter(productLike => productLike.productId == id)),
      ),
    ),
  };
  return self;
};

module.exports = loaders;

const sendMail = require('../config/mail');
const { SENDGRID_CC_EMAILS } = require('../config/environment');

module.exports = {
  UserInfo: {
    isCreator: async (parent, {}, { loaders }) => loaders.isCreator.load(parent.email),
    payment: async (parent, {}, { models }) =>
      models.Payment.findOne({ where: { userId: parent.id } }),
    productsCount: (parent, {}, { models }) =>
      models.Product.count({ where: { userId: parent.id } }),
    artworksCount: (parent, {}, { models }) =>
      models.Artwork.count({ where: { userId: parent.id } }),
    followersCount: (parent, {}, { models }) =>
      models.Following.count({ where: { followingId: parent.id } }),
    followings: async (parent, {}, { models }) => {
      const followings = await models.Following.findAll({ where: { userId: parent.id } });
      return followings ? followings.map(({ followingId }) => followingId) : [];
    },
  },
  Query: {
    me: async (_, {}, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUser: async (_, { username }, { user: loggedInUser, loaders, models }) => {
      const user = await loaders.userByUsername.load(username);
      const productsCount = await models.Product.count({ where: { userId: user.id } });
      const artworksCount = await models.Artwork.count({ where: { userId: user.id } });
      const followersCount = await models.Following.count({ where: { userId: user.id } });
      const followingsCount = await models.Following.count({ where: { followingId: user.id } });
      const isFollowing = loggedInUser ? await loaders.isFollowing.load(user.id) : false;
      return {
        ...user.dataValues,
        productsCount,
        artworksCount,
        followersCount,
        followingsCount,
        isFollowing,
      };
    },
  },
  Mutation: {
    saveUser: async (_, {}, { user, loaders, models }) => {
      try {
        const attr = user.attributes;
        if (!attr.email) {
          return { error: 'You need to use a Facebook account associated with an email' };
        }
        let existingUser = await models.User.findOne({
          where: {
            email: attr.email,
            userId: { [models.sequelize.Sequelize.Op.ne]: attr.sub },
          },
        });
        if (existingUser) {
          const identity = JSON.parse(attr.identities)[0];
          if (identity.userId === existingUser.providerUserId) {
            await models.User.update({ userId: attr.sub }, { where: { id: existingUser.id } });
            return {};
          }
          return { error: `${attr.email} email address is already registered` };
        }
        existingUser = await loaders.userByUserId.load(attr.sub);
        if (!existingUser) {
          const identity = JSON.parse(attr.identities)[0];
          let avatar;
          if (identity.providerType === 'Google') {
            avatar = attr.picture.substring(
              'https://lh3.googleusercontent.com/'.length,
              attr.picture.indexOf('s96-c'),
            );
          }
          await models.User.create({
            userId: attr.sub,
            providerType: identity.providerType,
            providerUserId: identity.userId,
            email: attr.email,
            username: `${attr.email.substring(0, attr.email.indexOf('@'))}`.toLowerCase(),
            firstName: attr.given_name,
            lastName: attr.family_name,
            avatar,
          });
        }
        return {};
      } catch (e) {
        return e;
      }
    },
    updateUser: async (_, { attributes }, { user, models }) => {
      try {
        const [, updatedUser] = await models.User.update(attributes, {
          where: { userId: user.attributes.sub },
          returning: true,
        });
        return updatedUser?.[0].dataValues;
      } catch (e) {
        return e;
      }
    },
    contactCreator: async (_, { mailInfo }, { user, loaders }) => {
      try {
        const fan = await loaders.userByUserId.load(user.attributes.sub);
        const product = await loaders.productById.load(mailInfo.productId);
        const creator = await loaders.userById.load(product.userId);

        try {
          const res = await sendMail({
            to: creator.email,
            subject: `Message for service: ${product.title}`,
            cc: fan.email,
            text: `
            The Fan ${fan.email} messaged you -

            ${mailInfo.message}

            For reply, please, write to this email address - ${fan.email}

            Kind regards, Crio team.
          `,
          });
          return true;
        } catch (e) {
          console.log('error sending email', e.response.body);
          throw e;
        }
      } catch (e) {
        console.log('error contactCreator', e);
        return e;
      }
    },
    cancelSubscription: async (_, {}, { user, loaders, models }) => {
      try {
        const { id, email } = await loaders.userByUserId.load(user.attributes.sub);
        const res = await sendMail({
          to: SENDGRID_CC_EMAILS,
          subject: 'Request for cancel subscription',
          text: `
          The Fan ${email} request to cancel the subscription.

          For reply, please, write to this email address - ${email}!

          Kind regards, Crio team.
        `,
        });
        if (res) {
          await models.Payment.update({ subscriptionCancel: true }, { where: { userId: id } });
          return true;
        }
      } catch (e) {
        console.log('error sending cancel subscription email', e.response.body);
        throw e;
      }
    },
  },
};

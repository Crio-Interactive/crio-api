const sendMail = require('../config/mail');
const { SENDGRID_CC_EMAILS } = require('../config/environment');

module.exports = {
  UserInfo: {
    isCreator: async (parent, {}, { loaders }) => loaders.isCreator.load(parent.email),
    vouchers: async (parent, {}, { models }) => models.Voucher.findOne({ where: { userId: parent.id }}),
    payment: async (parent, {}, { models }) => models.Payment.findOne({ where: { userId: parent.id }}),
    artworksCount: (parent, {}, { models }) => models.Artwork.count({ where: { userId: parent.id }}),
  },
  Query: {
    me: async (_, {}, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUser: async (_, { id }, { loaders, models }) => {
      const user = await loaders.userById.load(id);
      const artworksCount = await models.Artwork.count({ where: { userId: id }});
      return { ...user.dataValues, artworksCount };
    },
  },
  Mutation: {
    saveUser: async (_, {}, { user, loaders, models }) => {
      try {
        const attr = user.attributes;
        if (!attr.email) {
          return { error: 'You need to use a Facebook account associated with an email' };
        }
        let existingUser = await models.User.count({
          where: {
            email: attr.email,
            userId: { [models.sequelize.Sequelize.Op.ne]: attr.sub },
          }
        });
        if (existingUser) {
          return { error: `${attr.email} email address is already registered` };
        }
        existingUser = await loaders.userByUserId.load(attr.sub);
        if (!existingUser) {
          const identity = JSON.parse(attr.identities)[0];
          let avatar;
          if (identity.providerType === 'Google') {
            avatar = attr.picture.substring('https://lh3.googleusercontent.com/'.length, attr.picture.indexOf('s96-c'));
          }
          await models.User.create({
            userId: attr.sub,
            providerType: identity.providerType,
            providerUserId: identity.userId,
            email: attr.email,
            username: `${attr.given_name}_${attr.family_name}`.toLowerCase(),
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
    contactCreator: async (_, { mailInfo }, { user, models, loaders }) => {
      try {
        const fan = await loaders.userByUserId.load(user.attributes.sub);
        const creator = await loaders.userById.load(mailInfo.creatorId);
        const tierKey = `tier${mailInfo.tier}`;
        const vouchers = await models.Voucher.findOne({
          where: {
            userId: fan.id,
          }
        });
        if (vouchers[tierKey] <= 0) {
          return Promise.reject('Not enough vouchers!');
        }

        try {
          const res = await sendMail({
            to: creator.email,
            subject: `Request for service: Tier ${mailInfo.tier}`,
            cc: fan.email,
            text: `
            The Fan ${fan.email} messaged you -

            ${mailInfo.message}

            For reply, please, write to this email address - ${fan.email}!

            Kind regards, Crio team.
          `,
          });
          if (res) {
            vouchers[tierKey] = vouchers[tierKey] - 1;
            await vouchers.save();
            return true;
          }
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
    }
  },
};

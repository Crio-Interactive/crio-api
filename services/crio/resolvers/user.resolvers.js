const sendMail = require('../config/mail');

module.exports = {
  UserInfo: {
    isCreator: async (parent, {}, { loaders }) => loaders.isCreator.load(parent.email),
    vouchers: async (parent, {}, { models }) => models.Voucher.findOne({ where: { userId: parent.id }}),
    payment: async (parent, {}, { models }) => models.Payment.findOne({ where: { userId: parent.id }}),
  },
  Query: {
    me: async (_, {}, { user, loaders }) => loaders.userByUserId.load(user.attributes.sub),
    getUser: async (_, { id }, { loaders }) => loaders.userById.load(id),
  },
  Mutation: {
    saveUser: async (_, {}, { user, models }) => {
      try {
        const attr = user.attributes;
        const existingUser = await models.User.findOne({ where: { userId: attr.sub } });
        if (!existingUser) {
          return models.User.create({
            userId: attr.sub,
            fbUserId: user.username.substring(user.username.indexOf('_') + 1),
            email: attr.email,
            username: `${attr.given_name}_${attr.family_name}`,
            firstName: attr.given_name,
            lastName: attr.family_name,
          });
        }
        return existingUser;
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
        console.log('fan creator', fan, creator);
        const tierKey = `tier${mailInfo.tier}`;
        const vouchers = await models.Voucher.findOne({
          where: {
            userId: fan.id,
          }
        });
        console.log('vouchers', vouchers);
        if (vouchers[tierKey] <= 0) {
          return Promise.reject('Not enough vouchers!');
        }
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
        console.log('mailres', res);
        if (res) {
          vouchers[tierKey] = vouchers[tierKey] - 1;
          await vouchers.save();
          return true;
        }
      } catch (e) {
        console.log(JSON.stringify(e, null, 2));
        return e;
      }
    },
  },
};

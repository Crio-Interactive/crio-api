module.exports = {
  Query: {
    getPaymentMethod: async (_, {}, { user, loaders }) => {
      const { id } = await loaders.userByUserId.load(user.attributes.sub);
      return loaders.paymentMethodByUserId.load(id);
    },
  },
  Mutation: {
    updatePaymentMethod: async (_, { attributes }, { user, loaders, models }) => {
      try {
        const { id } = await loaders.userByUserId.load(user.attributes.sub);
        const paymentMethod = await loaders.paymentMethodByUserId.load(id);
        if (paymentMethod) {
          await models.PaymentMethod.update(
            {
              firstName: attributes.firstName,
              lastName: attributes.lastName,
              email: attributes.email,
              dob: attributes.dob,
              city: attributes.city,
              state: attributes.state,
              postalCode: attributes.postalCode,
              address: attributes.address,
              bankAccount: attributes.bankAccount,
              bankRouting: attributes.bankRouting,
            },
            { where: { id: paymentMethod.id } },
          );
        } else {
          await models.PaymentMethod.create({
            userId: id,
            firstName: attributes.firstName,
            lastName: attributes.lastName,
            email: attributes.email,
            dob: attributes.dob,
            city: attributes.city,
            state: attributes.state,
            postalCode: attributes.postalCode,
            address: attributes.address,
            bankAccount: attributes.bankAccount,
            bankRouting: attributes.bankRouting,
          });
        }
        return true;
      } catch (e) {
        return e;
      }
    },
  },
};

const db = require('../models');
const { createTransfer, retrieveAccount } = require('../utils/stripe.helper');

const createTransfers = async () => {
  console.log('START - Create Transfers');
  const [subscribersCount] = await db.sequelize.query(`
    SELECT COUNT(*) FROM "Payments"
    WHERE "Payments"."subscriptionStatus" = 'active'
      AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
  `);
  const [creatorsFollowersCount] = await db.sequelize.query(`
    SELECT
      "Users"."id" AS "userId",
      "Users"."stripeAccountId",
      (SELECT COUNT(*)
      FROM "Followings"
        INNER JOIN "Payments" ON "Followings"."userId"="Payments"."userId"
                              AND "Payments"."subscriptionStatus" = 'active'
                              AND ("Payments"."subscriptionCancel" IS NULL OR "Payments"."subscriptionCancel" = false)
      WHERE "Followings"."followingId"="Users"."id"
        AND "Followings"."deletedAt" IS NULL) AS "followersCount"
    FROM "Users" INNER JOIN "Creators" ON "Users"."email" = "Creators"."email"
    WHERE "Users"."deletedAt" IS NULL AND "Creators"."deletedAt" IS NULL
  `);

  const AMOUNT = 6.5;
  let totalFollowersCount = 0;
  creatorsFollowersCount.forEach(item => (totalFollowersCount += +item.followersCount));
  const price = (AMOUNT * subscribersCount[0].count * 80) / 100;
  try {
    await Promise.all(
      creatorsFollowersCount.map(async ({ userId, followersCount, stripeAccountId }) => {
        if (followersCount > 0 && stripeAccountId) {
          const amount = (followersCount / totalFollowersCount) * price;
          const account = await retrieveAccount(stripeAccountId);
          if (account.charges_enabled) {
            const snapshot = await createTransfer(stripeAccountId, (amount * 100).toFixed(0));
            await db.Transfer.create({
              userId,
              stripeAccountId,
              price: amount.toFixed(2),
              snapshot,
            });
          }
        }
      }),
    );
    console.log('END - Create Transfers');
  } catch (e) {
    console.log('Cannot transfer', e);
  }
  return true;
};

const handler = async () => {
  try {
    await createTransfers();
  } catch (e) {
    console.error('Error creating transfers', e);
  }
};

module.exports = handler;

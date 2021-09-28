const { ApolloServer } = require('apollo-server-lambda');
const logs = require('@tidepoollabs/node-lambda-logs');
const { getUserFromRequest } = require('@tidepoollabs/node-auth');

const schema = require('./schema');
const models = require('./models');
const loaders = require('./loaders');

logs.init(process.env.SENTRY_DSN);

const server = new ApolloServer({
  schema,
  plugins: [logs.apolloPlugin],
  formatError: err => ({ message: err.message, status: err.status }),
  context: async ({ event }) => {
    const modelLoaders = loaders(models);
    const user = await getUserFromRequest(event);
    const patient = await (user &&
      modelLoaders.userByUserId.load(user.username));
    return {
      models,
      user: user ? Object.assign(patient || {}, user) : null,
      loaders: modelLoaders,
    };
  },
  playground: {
    endpoint: '/prod/graphql',
  },
});

let invokedCount = 0;
exports.handler = logs.wrapHandler(
  async function (event, context) {
    console.log('INVOCATION NUMBER:', invokedCount + 1);
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    if (invokedCount) {
      // restart connection pool to ensure connections are not re-used across invocations
      models.sequelize.connectionManager.initPools();

      // restore `getConnection()` if it has been overwritten by `close()`
      if (models.sequelize.connectionManager.hasOwnProperty('getConnection')) {
        delete models.sequelize.connectionManager.getConnection;
      }
    }
    try {
      return await server.createHandler()(event, context);
    } finally {
      invokedCount += 1;
      await models.sequelize.connectionManager.close();
    }
  },
  {
    captureTimeoutWarning: false,
  },
);

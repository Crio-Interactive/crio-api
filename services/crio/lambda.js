const { ApolloServer } = require('apollo-server-lambda');
const logs = require('@tidepoollabs/node-lambda-logs');
const { getUserFromRequest } = require('@tidepoollabs/node-auth');

console.log(11111111);

const schema = require('./schema');
const models = require('./models');
const loaders = require('./loaders');

console.log(22222222);

logs.init(process.env.SENTRY_DSN);

console.log(33333333);

const server = new ApolloServer({
  schema,
  plugins: [logs.apolloPlugin],
  formatError: err => ({ message: err.message, status: err.status }),
  context: async ({ event }) => {
    const modelLoaders = loaders(models);
    const user = await getUserFromRequest(event);
    return {
      models,
      user,
      loaders: modelLoaders,
    };
  },
  playground: {
    endpoint: '/prod/graphql',
  },
});

console.log(4444444444);

let invokedCount = 0;
exports.handler = logs.wrapHandler(
  async function (event, context) {
    console.log(55555555);
    console.log('INVOCATION NUMBER:', invokedCount + 1);
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    console.log(66666666);
    if (invokedCount) {
      // restart connection pool to ensure connections are not re-used across invocations
      models.sequelize.connectionManager.initPools();

      // restore `getConnection()` if it has been overwritten by `close()`
      if (models.sequelize.connectionManager.hasOwnProperty('getConnection')) {
        delete models.sequelize.connectionManager.getConnection;
      }
    }
    console.log(77777777);
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

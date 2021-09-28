require('dotenv').config({ path: __dirname + '/.env' });
const { ApolloServer } = require('apollo-server');
const { getUserFromRequest } = require('@tidepoollabs/node-auth');

const schema = require('./schema');
const models = require('./models');
const loaders = require('./loaders');

const PORT = 4001;

const server = new ApolloServer({
  schema,
  formatError: err => {
    return { message: err.message, status: err.status };
  },
  context: async ({ req }) => {
    const modelLoaders = loaders(models);
    const user = await getUserFromRequest(req);
    const patient = await (user && modelLoaders.userByUserId.load(user.username));
    return {
      user: user ? Object.assign(patient || {}, user) : null,
      models,
      loaders: modelLoaders,
    };
  },
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Workouts server ready at ${url}`);
});

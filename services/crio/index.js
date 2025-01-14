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
    const user = await getUserFromRequest(req);
    const modelLoaders = loaders(models, user);
    return {
      user,
      models,
      loaders: modelLoaders,
    };
  },
});

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀 Crio server ready at ${url}`);
});

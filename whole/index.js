require('dotenv').config({ path: __dirname + '/.env' });
const { ApolloServer } = require('apollo-server-express');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const express = require('express');
const waitOn = require('wait-on');
const awsHelper = require('./awsHelper');
const PORT = 4000;
const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Initialize an ApolloGateway instance and pass it an array of
// your implementing service names and URLs
const gateway = new ApolloGateway({
  serviceList: [
    { name: 'crio', url: 'http://localhost:4001/' },
    { name: 'upload', url: 'http://localhost:4004/' },
    { name: 'manage-users', url: 'http://localhost:4005/' },
    // Define additional services here
  ],
  buildService({ _, url }) {
    return new RemoteGraphQLDataSource({
      url,
      async willSendRequest({ request, context }) {
        request.http.headers.set('token', context.token || null);
        if (context.token) {
          const user = await awsHelper.getUserFromToken(context.token);
          if (user) {
            request.http.headers.set(
              'user',
              JSON.stringify({
                ...user,
                attributes: {
                  ...user.attributes,
                  name: user.attributes.name.replace('“', '').replace('”', ''),
                },
              }),
            );
          }
        }
      },
    });
  },
});

// Pass the ApolloGateway to the ApolloServer constructor
const server = new ApolloServer({
  gateway,
  // Disable subscriptions (not currently supported with ApolloGateway)
  subscriptions: false,
  context: ({ req }) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7, authHeader.length)
      : '';

    return { token };
  },
});

const waitOnOptions = {
  resources: ['tcp:4001', 'tcp:4004', 'tcp:4005'],
};

waitOn(waitOnOptions)
  .then(() => {
    server.applyMiddleware({ app });

    app.listen({ port: PORT }, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  })
  .catch(err => {
    console.error('ERR:', err);
  });

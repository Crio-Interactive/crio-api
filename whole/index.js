require('dotenv').config({ path: __dirname + '/.env' });
const { ApolloServer } = require('apollo-server-express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const express = require('express');
const awsHelper = require('./awsHelper');
const PORT = 4000;
const app = express();

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use("/rest", createProxyMiddleware({
  target: 'http://localhost:5050',
  changeOrigin: true,
}));

app.use('/ws', createProxyMiddleware({
  target: 'ws://localhost:5050',
  ws: true,
  logLeve: 'debug',
}));

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
            request.http.headers.set('user', JSON.stringify(user));
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

server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
});

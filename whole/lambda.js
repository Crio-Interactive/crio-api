const { ApolloServer } = require('apollo-server-lambda');
const { Headers } = require('node-fetch');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const Lambda = require('aws-sdk/clients/lambda');
const logs = require('@tidepoollabs/node-lambda-logs');
const awsHelper = require('./awsHelper');

const lambda = new Lambda();

logs.init(process.env.SENTRY_DSN);

class LambdaGraphQLDataSource extends RemoteGraphQLDataSource {
  functionName;
  path = '/graphql';

  constructor(config) {
    super(config);
    if (config) {
      return Object.assign(this, config);
    }
  }

  async process({
    request,
    context,
  }) {
    const headers = (request.http && request.http.headers) || new Headers();
    headers.set('Content-Type', 'application/json');

    request.http = {
      method: 'POST',
      url: this.functionName,
      headers,
    };

    if (this.willSendRequest) {
      await this.willSendRequest({ request, context });
    }

    try {
      const headers = {};
      for (const [key, value] of request.http.headers) {
        headers[key] = value;
      }
      const event = {
        headers,
        body: Buffer.from(JSON.stringify(request)).toString('base64'),
        path: this.path,
        httpMethod: request.http.method,
        isBase64Encoded: true,
        pathParameters: {
          proxy: this.path,
        },
        requestContext: {
          accountId: 'dummy',
        },
      };

      const lambdaResponse = await lambda.invoke({
        FunctionName: this.functionName,
        Payload: JSON.stringify(event, null, 2), // pass params
      }).promise();

      const body = await this.didReceiveResponse(lambdaResponse, context);

      return body;
    } catch (error) {
      this.didEncounterError(error);
      throw error;
    }
  }

  async didReceiveResponse(response) {
    if (
      response.StatusCode &&
      response.StatusCode >= 200 &&
      response.StatusCode < 300
    ) {
      return this.parseBody(response);
    } else {
      throw await this.errorFromResponse(response);
    }
  }

  didEncounterError(error) {
    throw error;
  }

  async parseBody(response) {
    if (typeof response.Payload === "undefined") {
      return {};
    }
    const payload = JSON.parse(response.Payload.toString());
    return JSON.parse(payload.body);
  }

  async errorFromResponse(response) {
    // const message = `${response.StatusCode}: ${response.}`;
    const message = `unexpected error`;

    let error;
    if (response.StatusCode === 401) {
      error = new AuthenticationError(message);
    } else if (response.StatusCode === 403) {
      error = new ForbiddenError(message);
    } else {
      error = new ApolloError(message);
    }

    const body = await this.parseBody(response);

    Object.assign(error.extensions, {
      response: {
        // url: response.url,
        status: response.StatusCode,
        // statusText: response.statusText,
        body
      }
    });

    return error;
  }

}

const serviceList = [
  { name: 'crio', url: process.env.CRIO_URL },
  { name: 'upload', url: process.env.UPLOAD_URL },
  { name: 'manage-users', url: process.env.MANAGE_USERS_URL },
  // Define additional services here
];

// Initialize an ApolloGateway instance and pass it an array of
// your implementing service names and URLs
const gateway = new ApolloGateway({
  serviceList,
  buildService({ name, url }) {
    return new LambdaGraphQLDataSource({
      functionName: url,
      path: 'prod/graphql',
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
  introspection: true,
  playground: {
    endpoint: '/prod/graphql',
  },
  context: ({ event }) => {
    if (!event) {
      return {};
    }
    const authHeader = event.headers['Authorization'] || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7, authHeader.length)
      : '';

    return { token };
  },
});

exports.handler = logs.wrapHandler(function (event, context, callback) {
  context.callbackWaitsForEmptyEventLoop = false;
  const callbackFilter = function (error, output) {
    output.headers['Access-Control-Allow-Origin'] = '*';
    output.headers['Access-Control-Allow-Credentials'] = 'true';
    callback(error, output);
  };

  const callHandler = function () {
    const handler = server.createHandler({
      async onHealthCheck() {
        try {
          await server.executeOperation({ query: '{ __typename }' });
        } catch (executeOperationError) {
          console.error('error on api', executeOperationError);
          try {
            await server.stop();
          } catch (stopError) {
            console.error('error stopping server', stopError);
          } finally {
            console.info('server restarted');
            callHandler();
          }
        }
        return true;
      },
    });
    handler(event, context, callbackFilter);
  };
  callHandler();
});

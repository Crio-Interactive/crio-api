const path = require('path');
const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const apiGateway = require('@aws-cdk/aws-apigateway');
const route53 = require('@aws-cdk/aws-route53');
const targets = require('@aws-cdk/aws-route53-targets');
const { Effect, PolicyStatement } = require('@aws-cdk/aws-iam');
const appscaling = require('@aws-cdk/aws-applicationautoscaling');

const Utils = require('../utils');

const addAutoScaling = () => {
  const branchName = Utils.getEnv('CIRCLE_BRANCH');
  return ['master', 'staging', 'develop'].includes(branchName);
};

const minLambdaCapacity = () => {
  const branchName = Utils.getEnv('CIRCLE_BRANCH');
  return ['master'].includes(branchName) ? 4 : 1;
};

const lambdaFunctionName = fn => {
  const { functionName } = fn;
  return functionName + ':prod';
};

class AppStack extends cdk.Stack {
  userPool;
  apiRoot;
  apiUrl;
  lambdaFunctions;

  constructor(scope, id, props) {
    super(scope, id, props);
    this.lambdaFunctions = [];
    this.userPool = props.userPool;
    this.vpc = props.vpc;

    const { graphqlLambda: graphqlLambdaCrio } = this.createLambda('crio', {
      env: {
        CRIO_DATABASE_URL: props.crioDb.url,
        BUCKET_NAME: props.s3Bucket.bucketName,
        BUCKET_URL: 'https://' + props.s3Bucket.bucketDomainName,
      },
      invokeFunctions: [
        props.crioDb.proxy.grantConnect.bind(props.crioDb.proxy),
        props.s3Bucket.grantReadWrite.bind(props.s3Bucket),
      ],
    });

    const { graphqlLambda: graphqlLambdaManageUsers } = this.createLambda('manage-users', {
      env: {
        BUCKET_NAME: props.s3Bucket.bucketName,
        AWS_COGNITO_USER_POOL_ID: props.userPoolId,
      },
      invokeFunctions: [
        this.grantCognitoFullAccess.bind(this),
        props.s3Bucket.grantReadWrite.bind(props.s3Bucket),
      ],
    });

    const { graphqlLambda: graphqlLambdaUpload } = this.createLambda('upload', {
      env: {
        BUCKET_NAME: props.s3Bucket.bucketName,
      },
      invokeFunctions: [props.s3Bucket.grantReadWrite.bind(props.s3Bucket)],
    });

    const { domain } = this.createWholeLambda({
      stripeProps: {
        crioDb: props.crioDb,
        s3Bucket: props.s3Bucket,
      },
      env: {
        AWS_COGNITO_USER_POOL_ID: props.userPoolId,
        CRIO_URL: lambdaFunctionName(graphqlLambdaCrio),
        UPLOAD_URL: lambdaFunctionName(graphqlLambdaUpload),
        MANAGE_USERS_URL: lambdaFunctionName(graphqlLambdaManageUsers),
      },
      invokeFunctions: [
        this.grantCognitoFullAccess.bind(this),
        wholeLambda => {
          this.grantInvoke(wholeLambda, [
            graphqlLambdaUpload,
            graphqlLambdaManageUsers,
            graphqlLambdaCrio,
          ]);
        },
      ],
    });

    this.apiRoot = `https://${domain}`;
    this.apiUrl = `${this.apiRoot}/prod`;

    this.apiUrls = [this.apiUrl];

    // Output env vars;
    new cdk.CfnOutput(this, 'Endpoint', {
      description: 'GRAPHQL Endpoint',
      value: this.apiUrl,
    });
    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      description: 'UserPool ID',
      value: props.userPoolId,
    });
    new cdk.CfnOutput(this, 'CognitoDomain', {
      description: 'Cognito Domain',
      value: props.userPoolDomain,
    });
    new cdk.CfnOutput(this, 'CognitoAppClientId', {
      description: 'App Client ID',
      value: props.userPoolClientId,
    });
  }

  grantInvoke(role, functions) {
    role.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: functions.reduce((result, fn) => {
          result.push(fn.functionArn);
          result.push(`${fn.functionArn}:prod`);
          return result;
        }, []),
      }),
    );
  }

  grantCognitoFullAccess(lambda) {
    const userPool = this.userPool;
    lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:*'],
        resources: [
          `arn:aws:cognito-idp:${userPool.stack.region}:${userPool.stack.account}:userpool/${userPool.userPoolId}`,
        ],
      }),
    );
  }

  addAutoScaling(lambdaFunction, name) {
    const version = lambdaFunction.addVersion(Date.now().toString());
    const alias = new lambda.Alias(this, name + 'Alias', {
      aliasName: 'prod',
      version,
    });
    const scalingTarget = alias.addAutoScaling({
      minCapacity: minLambdaCapacity(),
      maxCapacity: 50,
    });
    scalingTarget.scaleOnUtilization({
      utilizationTarget: 0.5,
    });
    return alias;
  }

  createWholeLambda({ stripeProps, env, invokeFunctions = [] }) {
    const graphqlLambdaWhole = new lambda.Function(this, 'whole', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../whole')),
      handler: 'lambda.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      memorySize: 512,
      environment: {
        DEPLOYED_AT: Date.now().toString(),
        NODE_ENV: 'production',
        SENTRY_DSN: Utils.getEnv('SENTRY_DSN'),
        ...env,
      },
      timeout: cdk.Duration.seconds(100),
      reservedConcurrentExecutions: 10,
      tracing: 'Active',
    });
    invokeFunctions.forEach(fn => {
      fn(graphqlLambdaWhole);
    });
    let alias = graphqlLambdaWhole;
    if (addAutoScaling()) {
      alias = this.addAutoScaling(graphqlLambdaWhole, 'whole');
    }

    this.lambdaFunctions.push(graphqlLambdaWhole);

    const domainName = Utils.getEnv('DOMAIN_NAME');
    const subDomainName = Utils.getEnv('SUBDOMAIN_NAME');
    const {
      domainName: domain,
      certificate,
      zone,
    } = Utils.configureDomain(this, domainName, subDomainName, Utils.getEnv('STACK_REGION'));

    const defaultCorsPreflightOptions = {
      allowOrigins: apiGateway.Cors.ALL_ORIGINS,
      allowHeaders: [...apiGateway.Cors.DEFAULT_HEADERS, 'organizationKey'],
      allowCredentials: true,
    };

    const graphqlEndpointWhole = new apiGateway.LambdaRestApi(this, 'graphqlEndpointWhole', {
      proxy: false,
      domainName: {
        domainName: domain,
        certificate,
        endpointType: apiGateway.EndpointType.EDGE,
        securityPolicy: apiGateway.SecurityPolicy.TLS_1_2,
      },
      handler: alias,
      defaultCorsPreflightOptions,
    });

    const graphql = graphqlEndpointWhole.root.addResource('graphql');
    graphql.addMethod('ANY');

    const { alias: graphqlLambdaStripe } = this.createLambda('stripe', {
      env: {
        CRIO_DATABASE_URL: stripeProps.crioDb.url,
        BUCKET_NAME: stripeProps.s3Bucket.bucketName,
        BUCKET_URL: 'https://' + stripeProps.s3Bucket.bucketDomainName,
      },
      invokeFunctions: [
        stripeProps.crioDb.proxy.grantConnect.bind(stripeProps.crioDb.proxy),
        stripeProps.s3Bucket.grantReadWrite.bind(stripeProps.s3Bucket),
      ],
    });
    const stripeIntegration = new apiGateway.LambdaIntegration(graphqlLambdaStripe);
    const stripe = graphqlEndpointWhole.root.addResource('stripe', {
      defaultCorsPreflightOptions,
      defaultIntegration: stripeIntegration,
    });
    stripe.addMethod('POST');

    // Route53 alias record
    new route53.ARecord(this, 'ApiAliasRecord', {
      zone,
      recordName: domain,
      target: route53.RecordTarget.fromAlias(new targets.ApiGateway(graphqlEndpointWhole)),
    });

    return {
      domain,
    };
  }

  createLambda(
    serviceName,
    { autoScale = true, env = {}, customProps = {}, invokeFunctions = [] },
  ) {
    const graphqlLambda = new lambda.DockerImageFunction(this, serviceName, {
      // Where our function is located
      // code: lambda.Code.fromAsset(path.join(__dirname, `../services/${serviceName}`)),
      code: lambda.DockerImageCode.fromImageAsset(
        path.join(__dirname, `../services/${serviceName}`),
        {
          buildArgs: {
            NPM_TOKEN: Utils.getEnv('NPM_TOKEN'),
          },
        },
      ),
      // What should be executed once the lambda is invoked - in that case, the `handler` function exported by `lambda.js`
      memorySize: 512,
      retryAttempts: 2,
      timeout: cdk.Duration.seconds(100),
      reservedConcurrentExecutions: 5,
      tracing: 'Active',
      vpc: this.vpc,
      environment: {
        NPM_TOKEN: Utils.getEnv('NPM_TOKEN'),
        DEPLOYED_AT: Date.now().toString(),
        NODE_ENV: 'production',
        BUCKET: Utils.getEnv('BUCKET'),
        SENTRY_DSN: Utils.getEnv('SENTRY_DSN'),
        VIMEO_ACCESS_TOKEN: Utils.getEnv('VIMEO_ACCESS_TOKEN'),
        SENDGRID_API_KEY: Utils.getEnv('SENDGRID_API_KEY'),
        SENDGRID_VERIFIED_SENDER: Utils.getEnv('SENDGRID_VERIFIED_SENDER'),
        SENDGRID_CC_EMAILS: Utils.getEnv('SENDGRID_CC_EMAILS'),
        SENDGRID_TEMPLATE_CANCEL_SUBSCRIPTION: Utils.getEnv(
          'SENDGRID_TEMPLATE_CANCEL_SUBSCRIPTION',
        ),
        SENDGRID_TEMPLATE_DOWNLOAD: Utils.getEnv('SENDGRID_TEMPLATE_DOWNLOAD'),
        SENDGRID_TEMPLATE_INVITATION: Utils.getEnv('SENDGRID_TEMPLATE_INVITATION'),
        SENDGRID_TEMPLATE_NEW_MESSAGE: Utils.getEnv('SENDGRID_TEMPLATE_NEW_MESSAGE'),
        SENDGRID_TEMPLATE_PURCHASE: Utils.getEnv('SENDGRID_TEMPLATE_PURCHASE'),
        CLIENT_URL: Utils.getEnv('CLIENT_URL'),
        STRIPE_API_KEY: Utils.getEnv('STRIPE_API_KEY'),

        ...env,
      },
      ...customProps,
    });
    invokeFunctions.forEach(fn => {
      fn(graphqlLambda);
    });
    let alias = graphqlLambda;
    if (autoScale && addAutoScaling()) {
      alias = this.addAutoScaling(graphqlLambda, serviceName);
    }
    this.lambdaFunctions.push(graphqlLambda);
    return {
      graphqlLambda,
      alias,
    };
  }
}

module.exports = { AppStack };

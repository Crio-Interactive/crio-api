#!/usr/bin/env node

const cdk = require('@aws-cdk/core');
const { AppStack } = require('../lib/app-stack');
const { VpcStack } = require('../lib/vpc-stack');
const { S3Stack } = require('../lib/s3-stack');
const { RdsStack } = require('../lib/rds-stack');
const { CognitoStack } = require('../lib/cognito-stack');
const { CronStack } = require('../lib/cron-stack');
const Utils = require('../utils');

const app = new cdk.App();
const stackProps = {
  env: {
    account: Utils.getEnv('STACK_ACCOUNT'),
    region: Utils.getEnv('STACK_REGION'),
  },
};

const vpcStackEntity = new VpcStack(app, Utils.prefixByAppName('VpcStack'), stackProps);
const s3Stack = new S3Stack(app, Utils.prefixByAppName('S3Stack'), stackProps);
const rdsStack = new RdsStack(app, Utils.prefixByAppName('RdsStack'), {
  vpc: vpcStackEntity.vpc,
  ingressSecurityGroup: vpcStackEntity.ingressSecurityGroup,
  ...stackProps,
});
const cognitoStack = new CognitoStack(app, Utils.prefixByAppName('CognitoStack'), {
  ...stackProps,
});
const appStack = new AppStack(app, Utils.prefixByAppName('AppStack'), {
  crioDb: rdsStack.crioDb,
  s3Bucket: s3Stack.bucket,
  userPoolId: cognitoStack.userPoolId,
  userPoolDomain: cognitoStack.userPoolDomain,
  userPoolClientId: cognitoStack.userPoolClientId,
  userPool: cognitoStack.userPool,
  vpc: vpcStackEntity.vpc,
  ...stackProps,
});

const cronStack = new CronStack(app, Utils.prefixByAppName('CronStack'), {
  ...stackProps,
  crioDb: rdsStack.crioDb,
  vpc: vpcStackEntity.vpc,
  s3Bucket: s3Stack.bucket,
  appLambdaFunctions: appStack.lambdaFunctions,
});

app.synth();

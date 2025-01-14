const { Stack } = require('@aws-cdk/core');
const cognito = require('@aws-cdk/aws-cognito');
const Utils = require('../utils');

const GROUPS = ['doctor', 'patient'];

class CognitoStack extends Stack {
  userPool;
  userPoolId;
  userPoolClientId;
  userPoolDomain;

  constructor(scope, id, props) {
    super(scope, id, props);

    const appUrl = Utils.getEnv('CLIENT_URL');
    this.userPool = new cognito.UserPool(this, 'crioUserPool', {
      userPoolName: Utils.prefixByAppName('userpool'),
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for crio app!',
        emailBody:
          'Hello {username}, Thanks for signing up to crio! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      userInvitation: {
        emailSubject: 'Invite to join crio app!',
        emailBody:
          'Hello {username}, you have been invited to join crio app! Your temporary password is {####}',
      },
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      signInCaseSensitive: false,
      standardAttributes: {
        fullname: {
          required: false,
          mutable: true,
        },
        address: {
          required: false,
          mutable: true,
        },
        gender: {
          required: false,
          mutable: true,
        },
        phoneNumber: {
          required: false,
          mutable: true,
        },
        profilePicture: {
          required: false,
          mutable: true,
        },
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    // crete roles as groups
    GROUPS.forEach(role => {
      new cognito.CfnUserPoolGroup(this, role, {
        groupName: role,
        userPoolId: this.userPool.userPoolId,
      });
    });

    // create client for userPool
    const cfnUserPoolClient = new cognito.CfnUserPoolClient(
      this,
      Utils.prefixByAppName('UserPoolClient'),
      {
        supportedIdentityProviders: ['COGNITO'],
        clientName: 'Web',
        allowedOAuthFlowsUserPoolClient: true,
        allowedOAuthFlows: ['code'],
        allowedOAuthScopes: ['email', 'openid', 'profile'],
        explicitAuthFlows: ['ALLOW_REFRESH_TOKEN_AUTH', 'ALLOW_USER_SRP_AUTH'],
        preventUserExistenceErrors: 'ENABLED',
        generateSecret: false,
        refreshTokenValidity: 1,
        callbackUrLs: [appUrl],
        logoutUrLs: [appUrl],
        userPoolId: this.userPool.userPoolId,
      },
    );

    // create domain for client
    const cfnUserPoolDomain = new cognito.CfnUserPoolDomain(this, 'UserPoolDomain', {
      domain: Utils.prefixByAppName('auth'),
      userPoolId: this.userPool.userPoolId,
    });

    // output vars
    this.userPoolId = this.userPool.userPoolId;
    this.userPoolClientId = cfnUserPoolClient.ref;
    this.userPoolDomain = `${cfnUserPoolDomain.domain}.auth.${Utils.getEnv(
      'STACK_REGION',
    )}.amazoncognito.com`;
  }
}

module.exports = { CognitoStack };

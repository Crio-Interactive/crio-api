const AWS = require('aws-sdk');

class AwsHelper {
  cognito = null;

  constructor() {
    this.initCognito();
  }

  initCognito() {
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // check running on lambda
      this.cognito = new AWS.CognitoIdentityServiceProvider();
    } else {
      this.cognito = new AWS.CognitoIdentityServiceProvider({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      });
    }
  }

  async getUserFromToken(accessToken) {
    try {
      const { Username, UserAttributes } = await this.cognito
      .getUser({
        AccessToken: accessToken,
      })
      .promise();
      const { Groups } = await this.cognito
      .adminListGroupsForUser({
        Username,
        UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      })
      .promise();
      return {
        username: Username,
        groups: Groups.map(({ GroupName }) => GroupName),
        attributes: UserAttributes.reduce((result, attr) => {
          result[attr.Name] = attr.Value;
          return result;
        }, {}),
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

module.exports = new AwsHelper();

const aws = require('aws-sdk');
const route53 = require('@aws-cdk/aws-route53');
const certificateManager = require('@aws-cdk/aws-certificatemanager');

class Utils {
  static async getSecret(id) {
    const secretsmanager = new aws.SecretsManager();
    const secret = await secretsmanager.getSecretValue({
      SecretId: id
    }).promise();
    return JSON.parse(secret.SecretString);
  }
  static async getStackOutputs(stackName, stackRegion) {
    aws.config.region = stackRegion;
    const cfn = new aws.CloudFormation();
    const result = await cfn.describeStacks({ StackName: stackName }).promise();
    return result.Stacks[0].Outputs;
  }

  static getEnv(variableName, defaultValue) {
    const variable = process.env[variableName];
    if (!variable) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new Error(`${variableName} environment variable must be defined`);
    }
    return variable;
  }

  static prefixByAppName(str) {
    return `${Utils.getEnv('APP_NAME')}-${str}`;
  }

  // region should be us-east-1 for cloudfront
  static configureDomain(
    context, domainName, subDomainName, region = 'us-east-1') {
    const domain = subDomainName + '.' + domainName;
    const hostedZone = route53.HostedZone.fromLookup(context, 'Zone', {
      domainName,
    });

    let certificate;
    if (process.env.AWS_CERTIFICATE_ARN) {
      certificate = certificateManager.Certificate.fromCertificateArn(
        context,
        domainName,
        process.env.AWS_CERTIFICATE_ARN,
      );
    } else {
      certificate = new certificateManager.DnsValidatedCertificate(context,
        domainName, {
          region,
          domainName: `*.${domainName}`,
          hostedZone: hostedZone,
        });
    }

    return {
      certificate,
      zone: hostedZone,
      domainName: domain,
    };
  }
}

module.exports = Utils;

const path = require('path');
const events = require('@aws-cdk/aws-events');
const targets = require('@aws-cdk/aws-events-targets');
const lambda = require('@aws-cdk/aws-lambda');
const cdk = require('@aws-cdk/core');
const Utils = require('../utils');

class CronStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    this.props = props;

    // const pingServer = this.createCron('ping-server/lambda.handler', 'rate(1 minute)', {
    //   PING_FUNCTION_NAMES: props.appLambdaFunctions.map(fn => fn.functionName).join(','),
    // });
    // props.appLambdaFunctions.forEach(fn => {
    //   fn.grantInvoke(pingServer);
    // });

    const checkVideoServer = this.createCron('check-videos/lambda.handler', 'rate(1 minute)');
  }

  createCron(handler, schedule, env = {}) {
    const props = this.props;
    const lambdaFn = new lambda.DockerImageFunction(this, handler, {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, `../services/cron`), {
        buildArgs: {
          NPM_TOKEN: Utils.getEnv('NPM_TOKEN'),
        },
        cmd: [handler],
      }),
      memorySize: 512,
      timeout: cdk.Duration.seconds(300),
      vpc: props.vpc,
      environment: {
        NODE_ENV: 'production',
        DEPLOYED_AT: Date.now().toString(),
        SENTRY_DSN: Utils.getEnv('SENTRY_DSN'),
        ...env,
      },
    });
    props.s3Bucket.grantReadWrite(lambdaFn);

    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, handler + 'Rule', {
      schedule: events.Schedule.expression(schedule),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFn));
    return lambdaFn;
  }
}

module.exports = { CronStack };

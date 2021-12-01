const { Stack } = require('@aws-cdk/core');
const {
  GatewayVpcEndpointAwsService,
  Vpc,
} = require('@aws-cdk/aws-ec2');
const Utils = require('../utils');

class VpcStack extends Stack {
  vpc;
  constructor(scope, id, props) {
    super(scope, id, props);
    this.vpc = new Vpc(this, Utils.prefixByAppName('VPC'), {
      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
        },
      },
    });
  }
}
module.exports = { VpcStack };

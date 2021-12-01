const { Stack } = require('@aws-cdk/core');
const {
  Peer,
  Port,
  SecurityGroup,
  GatewayVpcEndpointAwsService,
  Vpc,
} = require('@aws-cdk/aws-ec2');
const Utils = require('../utils');

class VpcStack extends Stack {
  vpc;
  ingressSecurityGroup;
  constructor(scope, id, props) {
    super(scope, id, props);
    this.vpc = new Vpc(this, Utils.prefixByAppName('VPC'), {
      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
        },
      },
    });

    this.ingressSecurityGroup = new SecurityGroup(
      this,
      Utils.prefixByAppName('ingress-security-group'),
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        securityGroupName: Utils.prefixByAppName('IngressSecurityGroup'),
      },
    );
    this.ingressSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.allTraffic());
    this.ingressSecurityGroup.addEgressRule(Peer.anyIpv4(), Port.allTraffic());
  }
}
module.exports = { VpcStack };

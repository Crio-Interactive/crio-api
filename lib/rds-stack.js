const { Duration, Stack } = require('@aws-cdk/core');
const logs = require('@aws-cdk/aws-logs');
const rds = require('@aws-cdk/aws-rds');
const {
  SubnetType,
  InstanceType,
  InstanceClass,
  InstanceSize,
} = require('@aws-cdk/aws-ec2');
const Utils = require('../utils');

class RdsStack extends Stack {
  vpc;
  ingressSecurityGroup;
  dbUser = 'postgres';
  dbName = 'postgres';
  port = 5432;

  crioDb;

  constructor(scope, id, props) {
    super(scope, id, props);
    this.vpc = props.vpc;
    this.ingressSecurityGroup = props.ingressSecurityGroup;

    this.crioDb = this.createPostgresDb('crioDb');
  }

  createPostgresDb(name, props = {}) {
    const cluster = new rds.DatabaseCluster(this, Utils.prefixByAppName(name), {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_11_9,
      }),
      instanceProps: {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
        vpc: this.vpc,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        // securityGroups: [this.ingressSecurityGroup],
        enablePerformanceInsights: true,
        // performanceInsightRetention: Duration.days(7),
        publiclyAccessible: true,
        autoMinorVersionUpgrade: false,
      },
      storageEncrypted: true,
      port: this.port,
      clusterIdentifier: Utils.prefixByAppName(name),
      instanceIdentifierBase: Utils.prefixByAppName(name) + '-instance',
      defaultDatabaseName: this.dbName,
      deletionProtection: true,
      cloudwatchLogsRetention: logs.RetentionDays.ONE_YEAR,
      monitoringInterval: Duration.seconds(60),
      ...props,
    });
    const proxy = new rds.DatabaseProxy(
      this,
      Utils.prefixByAppName(name + '-proxy'),
      {
        proxyTarget: rds.ProxyTarget.fromCluster(cluster),
        secrets: [cluster.secret],
        vpc: this.vpc,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        securityGroups: [this.ingressSecurityGroup],
      },
    );
    return {
      cluster,
      proxy,
      url: `postgres://${this.dbUser}:${cluster.secret.secretValueFromJson(
        'password',
      )}@${proxy.endpoint}:${this.port}/${this.dbName}`,
    };
  }
}

module.exports = { RdsStack };

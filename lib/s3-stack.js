const { RemovalPolicy } = require('@aws-cdk/core');

const { Stack } = require('@aws-cdk/core');
const { Bucket } = require('@aws-cdk/aws-s3');
const Utils = require('../utils');

class S3Stack extends Stack {
  bucket;
  constructor(scope, id, props) {
    super(scope, id, props);
    this.bucket = new Bucket(this, Utils.prefixByAppName('bucket'), {
      cors: [{
        allowedMethods: ['GET', 'PUT', 'POST'],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      versioned: false,
      bucketName: Utils.prefixByAppName('bucket'),
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}

module.exports = { S3Stack };

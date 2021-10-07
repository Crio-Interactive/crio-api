#!/bin/sh

if [ -z "${AWS_LAMBDA_RUNTIME_API}" ]; then
  exec /usr/local/bin/aws-lambda-rie /var/task/node_modules/aws-lambda-ric $@
else
  ls -d /
  npm run migrate
  exec npx aws-lambda-ric $@
fi

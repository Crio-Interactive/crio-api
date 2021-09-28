# SENTRY_DSN env should be set on circleci

{
  echo "export STACK_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)"
  echo "export NODE_ENV=production"
  echo "export DOMAIN_NAME=hcx.ai"
} >> "$BASH_ENV"

if [ "${CIRCLE_BRANCH}" == "develop" ]
then
  {
    echo "export CLIENT_URL=https://qa-cardiac-admin-test.hcx.ai/"
    echo "export SUBDOMAIN_NAME=api-cardiac-qa-test"
    echo "export STACK_REGION=us-west-1"
    echo "export APP_NAME=cardiac-development"
    echo "export WEB_LINK=https://qa-cardiac-admin-test.hcx.ai"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "staging" ]
then
  {
    echo "export CLIENT_URL=https://staging-cardiac-admin-test.hcx.ai/"
    echo "export SUBDOMAIN_NAME=api-cardiac-staging-test"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=cardiac-staging"
    echo "export WEB_LINK=https://staging-cardiac-admin-test.hcx.ai"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "master" ]
then
  {
    echo "export CLIENT_URL=https://cardiac-admin-test.hcx.ai/"
    echo "export SUBDOMAIN_NAME=api-cardiac-test"
    echo "export STACK_REGION=us-east-1"
    echo "export APP_NAME=cardiac-production"
    echo "export WEB_LINK=https://cardiac-admin-test.hcx.ai"
  } >> "$BASH_ENV"
else
  #should not be executed
  echo "check your branch condition"
fi
# SENTRY_DSN env should be set on circleci

{
  echo "export STACK_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)"
  echo "export NODE_ENV=production"
  echo "export DOMAIN_NAME=tlabs.app"
} >> "$BASH_ENV"

if [ "${CIRCLE_BRANCH}" == "develop" ]
then
  {
    echo "export CLIENT_URL=https://crio-qa.tlabs.app/"
    echo "export SUBDOMAIN_NAME=crio-qa-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-development"
    echo "export VIMEO_ACCESS_TOKEN=230a1c36dd0fbf4ef7ed0c62a3513001"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "staging" ]
then
  {
    echo "export CLIENT_URL=https://crio-staging.tlabs.app/"
    echo "export SUBDOMAIN_NAME=crio-staging-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-staging"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "master" ]
then
  {
    echo "export CLIENT_URL=https://crio.tlabs.app/"
    echo "export SUBDOMAIN_NAME=crio-api"
    echo "export STACK_REGION=us-east-1"
    echo "export APP_NAME=crio-production"
  } >> "$BASH_ENV"
else
  #should not be executed
  echo "check your branch condition"
fi

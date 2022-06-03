# SENTRY_DSN env should be set on circleci

{
  echo "export STACK_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)"
  echo "export NODE_ENV=production"
  echo "export DOMAIN_NAME=criointeractive.com"
} >> "$BASH_ENV"

if [ "${CIRCLE_BRANCH}" == "develop" ]
then
  {
    echo "export CLIENT_URL=$CLIENT_URL_DEVELOP"
    echo "export SUBDOMAIN_NAME=crio-qa-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-development"
    echo "export SENDGRID_VERIFIED_SENDER=$SENDGRID_VERIFIED_SENDER_DEVELOP"
    echo "export SENDGRID_CC_EMAILS_STAGING=$SENDGRID_CC_EMAILS_STAGING"
    echo "export STRIPE_API_KEY=$STRIPE_API_KEY_DEVELOP"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "staging" ]
then
  {
    echo "export CLIENT_URL=$CLIENT_URL_STAGING"
    echo "export SUBDOMAIN_NAME=crio-staging-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-in-staging"
    echo "export SENDGRID_VERIFIED_SENDER=$SENDGRID_VERIFIED_SENDER_STAGING"
    echo "export SENDGRID_CC_EMAILS=$SENDGRID_CC_EMAILS_STAGING"
    echo "export STRIPE_API_KEY=$STRIPE_API_KEY_STAGING"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "master" ]
then
  {
    echo "export CLIENT_URL=$CLIENT_URL_MASTER"
    echo "export SUBDOMAIN_NAME=api"
    echo "export STACK_REGION=us-east-1"
    echo "export APP_NAME=crio-in-production"
    echo "export SENDGRID_VERIFIED_SENDER=$SENDGRID_VERIFIED_SENDER_MASTER"
    echo "export SENDGRID_CC_EMAILS=$SENDGRID_CC_EMAILS_MASTER"
    echo "export STRIPE_API_KEY=$STRIPE_API_KEY_MASTER"
  } >> "$BASH_ENV"
else
  #should not be executed
  echo "check your branch condition"
fi

# SENTRY_DSN env should be set on circleci

{
  echo "export STACK_ACCOUNT=$(aws sts get-caller-identity --query "Account" --output text)"
  echo "export NODE_ENV=production"
  echo "export DOMAIN_NAME=crio.live"
} >> "$BASH_ENV"

if [ "${CIRCLE_BRANCH}" == "develop" ]
then
  {
    echo "export CLIENT_URL=https://crio-qa.crio.live/"
    echo "export SUBDOMAIN_NAME=crio-qa-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-development"
    echo "export SENDGRID_VERIFIED_SENDER=info@crio.live"
    echo "export SENDGRID_CC_EMAILS=narine@tidepoollabs.com"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "staging" ]
then
  {
    echo "export CLIENT_URL=https://crio-staging.crio.live/"
    echo "export SUBDOMAIN_NAME=crio-staging-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-in-staging"
    echo "export SENDGRID_VERIFIED_SENDER=info@crio.live"
    echo "export SENDGRID_CC_EMAILS=narine@tidepoollabs.com"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "master" ]
then
  {
    echo "export CLIENT_URL=https://www.crio.live/"
    echo "export SUBDOMAIN_NAME=api"
    echo "export STACK_REGION=us-east-1"
    echo "export APP_NAME=crio-in-production"
    echo "export SENDGRID_VERIFIED_SENDER=info@crio.live"
    echo "export SENDGRID_CC_EMAILS=klodi.beqiri@crio.live"
  } >> "$BASH_ENV"
else
  #should not be executed
  echo "check your branch condition"
fi

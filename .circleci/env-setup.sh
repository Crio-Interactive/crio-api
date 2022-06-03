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
    echo "export SENDGRID_VERIFIED_SENDER=info@criointeractive.com"
    echo "export SENDGRID_CC_EMAILS=narine@tidepoollabs.com"
    echo "export STRIPE_API_KEY=sk_test_51JtbBcK5TIczT4JnkNsBiF16V27oKyEsJswywaefL0TC1qEx4XAVjAZ1BthkuNGb1EusNepWlHQCekl4w5uRmYyW00BLmQkq0M"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "staging" ]
then
  {
    echo "export CLIENT_URL=$CLIENT_URL_STAGING"
    echo "export SUBDOMAIN_NAME=crio-staging-api"
    echo "export STACK_REGION=us-west-2"
    echo "export APP_NAME=crio-in-staging"
    echo "export SENDGRID_VERIFIED_SENDER=info@criointeractive.com"
    echo "export SENDGRID_CC_EMAILS=narine@tidepoollabs.com"
    echo "export STRIPE_API_KEY=sk_test_51JtbBcK5TIczT4JnkNsBiF16V27oKyEsJswywaefL0TC1qEx4XAVjAZ1BthkuNGb1EusNepWlHQCekl4w5uRmYyW00BLmQkq0M"
  } >> "$BASH_ENV"
elif [ "${CIRCLE_BRANCH}" == "master" ]
then
  {
    echo "export CLIENT_URL=$CLIENT_URL_MASTER"
    echo "export SUBDOMAIN_NAME=api"
    echo "export STACK_REGION=us-east-1"
    echo "export APP_NAME=crio-in-production"
    echo "export SENDGRID_VERIFIED_SENDER=info@criointeractive.com"
    echo "export SENDGRID_CC_EMAILS=klodi.beqiri@criointeractive.com"
    echo "export STRIPE_API_KEY=sk_test_51JtbBcK5TIczT4JnkNsBiF16V27oKyEsJswywaefL0TC1qEx4XAVjAZ1BthkuNGb1EusNepWlHQCekl4w5uRmYyW00BLmQkq0M"
  } >> "$BASH_ENV"
else
  #should not be executed
  echo "check your branch condition"
fi

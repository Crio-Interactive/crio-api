source ./env.sh

set -o nounset
set -o errexit
set -o xtrace

echo "deploying backend"
# npx cdk bootstrap aws://"$STACK_ACCOUNT"/"$STACK_REGION"
npx cdk deploy --all --require-approval=never

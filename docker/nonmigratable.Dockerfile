FROM amazon/aws-lambda-nodejs:14

ARG NPM_TOKEN
ARG NODE_ENV=production
ARG FUNCTION_DIR="/var/task"

RUN mkdir -p ${FUNCTION_DIR}

COPY / ${FUNCTION_DIR}/

RUN ["npm", "install"]

CMD [ "lambda.handler" ]

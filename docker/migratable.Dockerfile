FROM amazon/aws-lambda-nodejs:16.2022.05.09.14

ARG NPM_TOKEN
ARG NODE_ENV=production
ARG FUNCTION_DIR="/var/task"

RUN mkdir -p ${FUNCTION_DIR}

COPY / ${FUNCTION_DIR}/

RUN yum install sudo -y
RUN sudo yum groupinstall "Development Tools" -y
RUN sudo yum install cmake3 tar gzip autoconf automake libtool -y
RUN ["npm", "install"]
RUN npm i aws-lambda-ric
RUN ["npm", "install", "sequelize-cli", "-g"]
RUN chmod +x migrate-entrypoint.sh
ENTRYPOINT ["/var/task/migrate-entrypoint.sh"]

CMD [ "lambda.handler" ]

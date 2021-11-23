const fromUnixTime = require('date-fns/fromUnixTime');
const addMonths = require('date-fns/addMonths');
const getUnixTime = require('date-fns/getUnixTime');

function formatResponse(body) {
  return {
    'statusCode': 200,
    'headers': {
      'Content-Type': 'application/json',
    },
    'isBase64Encoded': false,
    'body': body,
  };
}

function formatError(error) {
  return  {
    'statusCode': error.statusCode,
    'headers': {
      'Content-Type': 'text/plain',
      'x-amzn-ErrorType': error.code,
    },
    'isBase64Encoded': false,
    'body': error.code + ': ' + error.message,
  };
}

function serialize(object) {
  return JSON.stringify(object, null, 2);
}

const addUnixTimeMonth = (unixTime) => {
  const date = fromUnixTime(unixTime);
  const result = addMonths(date, 1);
  return getUnixTime(result);
};

module.exports = {
  formatError,
  formatResponse,
  serialize,
  addUnixTimeMonth,
};

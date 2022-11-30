const handler = require('./index');

setInterval(() => {
  handler().then().catch(e => console.log(e));
}, 30000);

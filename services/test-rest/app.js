const express = require('express');
const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

app.use('/', (req, res) => {
  console.log(req.headers);
  return res.json('rest works 🚀');
});

module.exports = app;

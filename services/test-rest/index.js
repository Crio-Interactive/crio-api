require('dotenv').config({ path: __dirname + '/.env' });
const server = require('http').createServer();
const app = require('./app');

server.on('request', app);

const ws = require('ws');
const port = 5050;

const wsServer = new ws.Server({ server: server });

wsServer.on('connection', socket => {
  socket.on('message', message => {
    socket.send('It works 😃 ✔️ 🚀 ' + message);
  });
});

// server.on('upgrade', (req, socket, head) => {
//   wsServer.handleUpgrade(req, socket, head, (socket) => {
//     wsServer.emit('connection', socket, request);
//   });
// });

server.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

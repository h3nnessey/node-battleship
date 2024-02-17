import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3000 });

wss.on('listening', () => {
  console.log('WS Server is listening on port 3000');
});

wss.on('connection', (ws) => {
  ws.on('error', (error) => {
    console.log(error);
  });

  ws.on('message', (message) => {});
});

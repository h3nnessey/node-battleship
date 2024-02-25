import { WebSocketServer } from 'ws';
import { WebSocketController } from '@/controllers';

const wss = new WebSocketServer({ port: 3000 });
const controller = new WebSocketController();

wss.on('listening', () => {
  console.log('WS Server is listening on port 3000');
});

wss.on('connection', async (ws, req) => {
  const id = `${req.socket.remoteAddress}:${req.socket.remotePort}`;

  await controller.onConnection(ws);

  ws.on('message', async (message) => {
    await controller.processMessage(ws, message.toString(), id);
  });

  ws.on('error', (error) => {
    console.log(error);
  });

  ws.on('close', async (code, reason) => {
    await controller.onClose(ws, code, reason.toString().trim());
  });
});

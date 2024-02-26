import { WebSocketServer } from 'ws';
import { WebSocketController } from '@/controllers';
import { WS_SERVER_PORT } from '@/constants';

const wss = new WebSocketServer({ port: WS_SERVER_PORT });
const controller = new WebSocketController();

wss.on('listening', () => {
  console.log(`WS Server is listening on port ${WS_SERVER_PORT}`);
});

wss.on('connection', async (ws, request) => {
  const address = `${request.socket.remoteAddress}:${request.socket.remotePort}`;

  await controller.onConnection(ws, address);

  ws.on('message', async (message) => {
    await controller.processMessage(ws, message.toString(), address);
  });

  ws.on('error', (error) => {
    console.log(error);
  });

  ws.on('close', async () => {
    await controller.onClose(ws, address);
  });
});

wss.on('close', () => {
  wss.clients.forEach((client) => {
    client.close();
  });
});

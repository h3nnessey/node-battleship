import { WebSocketServer } from 'ws';
import { WebSocketController } from '@/controllers';
import { WS_SERVER_PORT } from '@/constants';

const wss = new WebSocketServer({ port: WS_SERVER_PORT });
const controller = new WebSocketController();

wss.on('listening', () => {
  console.log(`WS Server is listening on port ${WS_SERVER_PORT}`);
});

wss.on('connection', async (ws) => {
  await controller.onConnection(ws);

  ws.on('message', async (message) => {
    await controller.processMessage(ws, message.toString());
  });

  ws.on('error', (error) => {
    console.log(error);
  });

  ws.on('close', async (code, reason) => {
    await controller.onClose(ws, code, reason.toString().trim());
  });
});

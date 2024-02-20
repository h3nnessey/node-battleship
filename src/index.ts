import { WebSocketServer } from 'ws';
import { WebSocketController } from '@/controllers';

const wss = new WebSocketServer({ port: 3000 });
const controller = new WebSocketController();

wss.on('listening', () => {
  console.log('WS Server is listening on port 3000');
});

wss.on('connection', (ws) => {
  controller.onConnection(ws);

  ws.on('message', async (message) => {
    await controller.processMessage(ws, message.toString());
  });

  ws.on('error', (error) => {
    console.log(error);
  });

  ws.on('close', (code, reason) => {
    controller.onClose(ws, code, reason.toString().trim());
  });
});

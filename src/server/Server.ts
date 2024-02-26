import { WebSocketServer } from 'ws';
import { WebSocketController } from '@/controllers';
import { WS_SERVER_PORT } from '@/constants';
import { Colors, colorize } from '@/utils';

export class Server {
  private readonly _controller = new WebSocketController();
  private _wss: WebSocketServer | null = null;

  public async start(): Promise<void> {
    this._wss = new WebSocketServer({ port: WS_SERVER_PORT });

    this._wss.on('listening', () => {
      const message = colorize(
        `[WEBSOCKET SERVER] LISTENING ON PORT ${WS_SERVER_PORT}`,
        Colors.Green,
      );

      console.log(message);
    });

    this._wss.on('connection', async (ws, request) => {
      const address = `${request.socket.remoteAddress}:${request.socket.remotePort}`;

      await this._controller.onConnection(ws, address);

      ws.on('message', async (message) => {
        await this._controller.processMessage(ws, message.toString(), address);
      });

      ws.on('error', (error) => {
        console.error(colorize(error.message, Colors.Red));
      });

      ws.on('close', async () => {
        await this._controller.onClose(ws, address);
      });
    });

    this._wss.on('close', () => {
      this._wss?.clients.forEach((client) => {
        client.close();
      });
    });
  }
}

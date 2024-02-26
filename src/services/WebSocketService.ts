import { WebSocket } from 'ws';
import { getSerializer } from '@/utils';
import type { UserPublicData, NotifyArgs } from '@/types';

export class WebSocketService {
  private readonly _sockets = new Map<WebSocket, UserPublicData | undefined>();

  private static instance: WebSocketService;

  constructor() {
    if (!WebSocketService.instance) {
      WebSocketService.instance = this;
    }

    return WebSocketService.instance;
  }

  public async addSocket(ws: WebSocket): Promise<void> {
    this._sockets.set(ws, undefined);
  }

  public async link(ws: WebSocket, user: UserPublicData): Promise<void> {
    this._sockets.set(ws, user);
  }

  public async unlink(ws: WebSocket): Promise<void> {
    this._sockets.delete(ws);
  }

  public async getLinkedUser(ws: WebSocket): Promise<UserPublicData> {
    const user = this._sockets.get(ws);

    if (!user) {
      throw new Error('User is not found');
    }

    return user;
  }

  public async getLinkedSocketByName(name: string): Promise<WebSocket> {
    const sockets = await this.getAllSockets();
    const ws = sockets.find((ws) => this._sockets.get(ws)?.name === name);

    if (!ws) {
      throw new Error('Linked socket is not found');
    }

    return ws;
  }

  public async getLinkedSocketByIndex(index: number): Promise<WebSocket> {
    const sockets = await this.getAllSockets();
    const ws = sockets.find((ws) => this._sockets.get(ws)?.index === index);

    if (!ws) {
      throw new Error('Linked socket is not found');
    }

    return ws;
  }

  public async getAllSockets(): Promise<WebSocket[]> {
    return Array.from(this._sockets.keys());
  }

  public async notifyAll(type: string, data: unknown): Promise<void> {
    const sockets = await this.getAllSockets();

    sockets.forEach((ws) => {
      if (ws.readyState === 1) {
        this.notify([[ws, type, data]]);
      }
    });
  }

  public async notify(args: NotifyArgs): Promise<void> {
    args.forEach((arg) => {
      const [ws, type, data] = arg;

      if (ws.readyState === 1) {
        const dataType = typeof data;
        const serializer = getSerializer(dataType);

        ws.send(
          JSON.stringify({
            type,
            data: serializer(data),
            id: 0,
          }),
        );
      }
    });
  }

  public async closeBotSocket(sockets: WebSocket[]): Promise<void> {
    sockets.forEach(async (socket) => {
      const user = await this.getLinkedUser(socket);
      if (user.isBot) {
        await this.unlink(socket);
        socket.close();
      }
    });
  }
}

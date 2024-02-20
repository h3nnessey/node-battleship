import type { WebSocket } from 'ws';
import type { UserPublicData } from '@/types';
import { getSerializer } from '@/utils/getSerializer';

export class WebSocketService {
  private readonly _sockets = new Map<WebSocket, UserPublicData | undefined>();

  public addSocket(ws: WebSocket): void {
    this._sockets.set(ws, undefined);
  }

  public link(ws: WebSocket, user: UserPublicData): void {
    this._sockets.set(ws, user);
  }

  public unlink(ws: WebSocket): void {
    this._sockets.delete(ws);
  }

  public getLinkedUser(ws: WebSocket): UserPublicData | undefined {
    return this._sockets.get(ws);
  }

  public getLinkedSocketByName(name: string): WebSocket | undefined {
    return this.getAllSockets().find((ws) => this.getLinkedUser(ws)?.name === name);
  }

  public getLinkedSocketByIndex(index: number): WebSocket | undefined {
    return this.getAllSockets().find((ws) => this.getLinkedUser(ws)?.index === index);
  }

  public getAllSockets(): WebSocket[] {
    return Array.from(this._sockets.keys());
  }

  public isUserOnline(name: string): boolean {
    return this.getAllSockets().some((ws) => this.getLinkedUser(ws)?.name === name);
  }

  public notifyAll(type: string, data: unknown): void {
    this.getAllSockets().forEach((ws) => {
      if (ws.readyState === 1) {
        this.notify(ws, type, data);
      }
    });
  }

  public notify(ws: WebSocket, type: string, data: unknown): void {
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
  }
}

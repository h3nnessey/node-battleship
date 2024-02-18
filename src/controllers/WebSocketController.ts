import type { WebSocket } from 'ws';
import { RegisterUserRequestData, RequestMessages, MessageTypes } from '@/types';
import { UserService } from '@/services';
import { sendMessageToWebSocket } from '@/utils';

interface Room {
  roomId: number;
  roomUsers: { name: string; index: number }[];
}

const rooms: Room[] = [];

export class WebSocketController {
  private readonly _userService = new UserService();

  private async _registerUser(ws: WebSocket, data: RegisterUserRequestData) {
    const result = await this._userService.registerUser(data);

    sendMessageToWebSocket(ws, MessageTypes.Reg, result);

    if (!result.error) {
      await this._updateRoom(ws);
      await this._updateWinners(ws);
    }
  }

  private async _updateWinners(ws: WebSocket) {
    sendMessageToWebSocket(ws, MessageTypes.UpdateWinners, []);
  }

  private async _updateRoom(ws: WebSocket) {
    sendMessageToWebSocket(ws, MessageTypes.UpdateRoom, []);
  }

  private async _createRoom(ws: WebSocket) {
    const room = { roomId: Date.now(), roomUsers: [{ name: 'qweqwe', index: 1 }] };
    rooms.push(room);
    sendMessageToWebSocket(ws, MessageTypes.UpdateRoom, rooms);
  }

  private async _addUserToRoom(ws: WebSocket) {}

  private async _createGame(ws: WebSocket) {}

  private async _addShips(ws: WebSocket) {}

  private async _startGame(ws: WebSocket) {}

  private async _attack(ws: WebSocket) {}

  private async _randomAttack(ws: WebSocket) {}

  private async _turn(ws: WebSocket) {}

  private async _finish(ws: WebSocket) {}

  async processMessage(ws: WebSocket, message: string) {
    try {
      const method = this._getMethodFromMessage(ws, message);

      if (method) {
        await method();
      }
    } catch (error) {
      console.log(error);
    }
  }

  private _getMethodFromMessage(ws: WebSocket, message: string) {
    const { type, data } = this._parseMessage(message);

    switch (type) {
      case MessageTypes.Reg: {
        return this._registerUser.bind(this, ws, data);
      }
      case MessageTypes.CreateRoom: {
        return this._createRoom.bind(this, ws);
      }
      case MessageTypes.AddUserToRoom: {
        return this._addUserToRoom.bind(this, ws);
      }
      case MessageTypes.AddShips: {
        return this._addShips.bind(this, ws);
      }
      case MessageTypes.Attack: {
        return this._attack.bind(this, ws);
      }
      case MessageTypes.RandomAttack: {
        return this._randomAttack.bind(this, ws);
      }
      default:
        return null;
    }
  }

  private _parseMessage(message: string): RequestMessages {
    const json = JSON.parse(message);
    const data =
      typeof json.data === 'string' && json.data.length > 0 ? JSON.parse(json.data) : json.data;

    return {
      type: json.type,
      data,
      id: json.id || 0,
    };
  }
}

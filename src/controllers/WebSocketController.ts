import type { WebSocket } from 'ws';
import { RegisterUserRequestData, RequestMessages, MessageTypes, AddUserToRoomData } from '@/types';
import { RoomService, UserService, WinnerService, WebSocketService } from '@/services';

export class WebSocketController {
  private readonly _userService = new UserService();
  private readonly _roomService = new RoomService();
  private readonly _winnerService = new WinnerService();
  private readonly _webSocketService = new WebSocketService();

  private async _registerUser(ws: WebSocket, data: RegisterUserRequestData) {
    const result = await this._userService.registerUser(data);

    this._webSocketService.notify(ws, MessageTypes.Reg, result);

    if (!result.error) {
      this._webSocketService.linkSocketWithUser(ws, {
        name: result.name,
        index: result.index,
      });

      await this._updateRoom();
      await this._updateWinners();
    }
  }

  private async _updateWinners() {
    const result = await this._winnerService.getWinners();

    this._webSocketService.notifyAll(MessageTypes.UpdateWinners, result);
  }

  private async _updateRoom() {
    const result = await this._roomService.getRooms();

    this._webSocketService.notifyAll(MessageTypes.UpdateRoom, result);
  }

  private async _createRoom(ws: WebSocket) {
    const user = this._webSocketService.getLinkedUser(ws);

    if (user) {
      await this._roomService.createRoom(user);

      await this._updateRoom();
    }
  }

  // <--    add_user_to_room
  // <--    update_room    -->
  // <--    create_game    -->

  private async _addUserToRoom(ws: WebSocket, data: AddUserToRoomData) {
    const user = this._webSocketService.getLinkedUser(ws);

    if (user) {
      await this._roomService.addUserToRoom(user, data.indexRoom);

      await this._updateRoom();
      await this._createGame(ws);
    }
  }

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

  public registerSocket(ws: WebSocket) {
    this._webSocketService.addSocket(ws);
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
        return this._addUserToRoom.bind(this, ws, data);
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

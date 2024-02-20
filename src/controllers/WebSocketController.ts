import type { WebSocket } from 'ws';
import {
  RegisterUserRequestData,
  RequestMessages,
  MessageTypes,
  AddUserToRoomData,
  Room,
} from '@/types';
import { RoomService, UserService, WinnerService, WebSocketService, GameService } from '@/services';

export class WebSocketController {
  private readonly _userService = new UserService();
  private readonly _roomService = new RoomService();
  private readonly _winnerService = new WinnerService();
  private readonly _webSocketService = new WebSocketService();
  private readonly _gameService = new GameService();

  private async _registerUser(ws: WebSocket, { name, password }: RegisterUserRequestData) {
    const isUserOnline = this._webSocketService.isUserOnline(name);

    if (isUserOnline) {
      return this._webSocketService.notify(ws, MessageTypes.Reg, {
        name,
        index: 0,
        error: true,
        errorText: `User with name: ${name} is already online`,
      });
    }

    const result = await this._userService.registerUser({ name, password });

    this._webSocketService.notify(ws, MessageTypes.Reg, result);

    if (!result.error) {
      this._webSocketService.link(ws, {
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

  private async _addUserToRoom(ws: WebSocket, data: AddUserToRoomData) {
    const user = this._webSocketService.getLinkedUser(ws);

    if (user) {
      const room = await this._roomService.addUserToRoom(user, data.indexRoom);

      await this._updateRoom();
      await this._createGame(room);
    }
  }

  private async _createGame(room?: Room) {
    if (room) {
      const gameData = await this._gameService.createGame(room);

      const user1 = room.roomUsers.at(0);
      const user2 = room.roomUsers.at(1);

      if (gameData && user1 && user2) {
        const user1Socket = this._webSocketService.getLinkedSocket(user1.name || '');
        const user2Socket = this._webSocketService.getLinkedSocket(user2.name || '');

        const isReadyToNotify = user1Socket && user2Socket;

        if (isReadyToNotify) {
          this._webSocketService.notify(user1Socket, MessageTypes.CreateGame, gameData.at(0));
          this._webSocketService.notify(user2Socket, MessageTypes.CreateGame, gameData.at(1));
        }
      }
    }
  }

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

  public onConnection(ws: WebSocket) {
    this._webSocketService.addSocket(ws);
  }

  public onClose(ws: WebSocket, code: number, reason: string) {
    const user = this._webSocketService.getLinkedUser(ws);

    this._webSocketService.unlink(ws);

    console.log(
      `Connection${user ? ` of ${user.name}` : ''} closed with code ${code}${reason.length ? ` and reason ${reason}` : ''}`,
    );
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

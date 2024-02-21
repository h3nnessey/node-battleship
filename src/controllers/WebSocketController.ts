import type { WebSocket } from 'ws';
import {
  RegisterUserRequestData,
  RequestMessages,
  MessageTypes,
  AddUserToRoomData,
  Room,
  AddShipsData,
} from '@/types';
import { RoomService, UserService, WinnerService, WebSocketService, GameService } from '@/services';

// TODO: make all functions async
export class WebSocketController {
  private readonly _userService = new UserService();
  private readonly _roomService = new RoomService();
  private readonly _winnerService = new WinnerService();
  private readonly _webSocketService = new WebSocketService();
  private readonly _gameService = new GameService();

  private async _registerUser(
    ws: WebSocket,
    { name, password }: RegisterUserRequestData,
  ): Promise<void> {
    const result = await this._userService.registerUser({ name, password });

    await this._webSocketService.notify([[ws, MessageTypes.Reg, result]]);

    if (!result.error) {
      await this._webSocketService.link(ws, {
        name: result.name,
        index: result.index,
      });

      await this._updateRoom();
      await this._updateWinners();
    }
  }

  private async _updateWinners(): Promise<void> {
    const result = await this._winnerService.getWinners();

    await this._webSocketService.notifyAll(MessageTypes.UpdateWinners, result);
  }

  private async _updateRoom(): Promise<void> {
    const result = await this._roomService.getRooms();

    await this._webSocketService.notifyAll(MessageTypes.UpdateRoom, result);
  }

  private async _createRoom(ws: WebSocket): Promise<void> {
    const user = await this._webSocketService.getLinkedUser(ws);

    await this._roomService.createRoom(user);
    await this._updateRoom();
  }

  private async _addUserToRoom(ws: WebSocket, data: AddUserToRoomData): Promise<void> {
    const user = await this._webSocketService.getLinkedUser(ws);
    const room = await this._roomService.addUserToRoom(data.indexRoom, user);

    await this._updateRoom();
    await this._createGame(room);
  }

  private async _createGame(room: Room): Promise<void> {
    const [playerData1, playerData2] = await this._gameService.createGame(room);
    const playerWs1 = await this._webSocketService.getLinkedSocketByIndex(playerData1.idPlayer);
    const playerWs2 = await this._webSocketService.getLinkedSocketByIndex(playerData2.idPlayer);

    await this._webSocketService.notify([
      [playerWs1, MessageTypes.CreateGame, playerData1],
      [playerWs2, MessageTypes.CreateGame, playerData2],
    ]);
  }

  private async _addShips(data: AddShipsData): Promise<void> {
    const result = await this._gameService.addShips(data);

    if (result.isGameReady) {
      const {
        playersIndex: [playerIndex1, playerIndex2],
      } = result;

      await this._startGame(playerIndex1, playerIndex2, data.gameId);
    }
  }

  private async _startGame(
    playerIndex1: number,
    playerIndex2: number,
    gameId: number,
  ): Promise<void> {
    const [player1, player2] = await this._gameService.startGame(gameId);

    const playerWs1 = await this._webSocketService.getLinkedSocketByIndex(playerIndex1);
    const playerWs2 = await this._webSocketService.getLinkedSocketByIndex(playerIndex2);

    await this._webSocketService.notify([
      [playerWs1, MessageTypes.StartGame, player1],
      [playerWs2, MessageTypes.StartGame, player2],
    ]);

    await this._turn(playerWs1, playerWs2, player1.currentPlayerIndex);
  }

  private async _turn(
    playerWs1: WebSocket,
    playerWs2: WebSocket,
    currentPlayer: number,
  ): Promise<void> {
    await this._webSocketService.notify([
      [
        playerWs1,
        MessageTypes.Turn,
        {
          currentPlayer,
        },
      ],
      [
        playerWs2,
        MessageTypes.Turn,
        {
          currentPlayer,
        },
      ],
    ]);
  }

  private async _attack(ws: WebSocket) {}

  private async _randomAttack(ws: WebSocket) {}

  private async _finish(ws: WebSocket) {}

  public async processMessage(ws: WebSocket, message: string): Promise<void> {
    try {
      const method = await this._getMethodFromMessage(ws, message);

      if (method) {
        await method();
      }
    } catch (error) {
      console.log(error instanceof Error ? error.message : 'error');
    }
  }

  public async onConnection(ws: WebSocket): Promise<void> {
    await this._webSocketService.addSocket(ws);
  }

  public async onClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    try {
      const user = await this._webSocketService.getLinkedUser(ws);

      await this._webSocketService.unlink(ws);
      await this._roomService.deleteUserRoom(user.name);
      await this._updateRoom();

      console.log(
        `Connection of ${user.name} closed with code ${code}${reason.length ? ` and reason ${reason}` : ''}`,
      );
    } catch {
      console.log(
        `Connection closed with code ${code}${reason.length ? ` and reason ${reason}` : ''}`,
      );
    }
  }

  private async _getMethodFromMessage(ws: WebSocket, message: string) {
    const { type, data } = await this._parseMessage(message);

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
        return this._addShips.bind(this, data);
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

  private async _parseMessage(message: string): Promise<RequestMessages> {
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

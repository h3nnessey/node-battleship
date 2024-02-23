import type { WebSocket } from 'ws';
import {
  RegisterUserRequestData,
  RequestMessages,
  MessageTypes,
  AddUserToRoomData,
  Room,
  AddShipsData,
  AttackData,
  RandomAttackData,
} from '@/types';
import { getRandomInt } from '@/utils';
import { RoomService, UserService, WinnerService, WebSocketService, GameService } from '@/services';

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
    const {
      isGameReady,
      playersIndex: [playerIndex1, playerIndex2],
    } = await this._gameService.addShips(data);

    if (isGameReady) {
      await this._startGame(playerIndex1, playerIndex2, data.gameId);
    }
  }

  private async _startGame(
    playerIndex1: number,
    playerIndex2: number,
    gameId: number,
  ): Promise<void> {
    const {
      nextTurnIndex,
      players: [player1, player2],
    } = await this._gameService.startGame(gameId);

    const playerWs1 = await this._webSocketService.getLinkedSocketByIndex(playerIndex1);
    const playerWs2 = await this._webSocketService.getLinkedSocketByIndex(playerIndex2);

    await this._webSocketService.notify([
      [playerWs1, MessageTypes.StartGame, player1],
      [playerWs2, MessageTypes.StartGame, player2],
    ]);

    await this._turn(playerWs1, playerWs2, nextTurnIndex);
  }

  private async _attack(data: AttackData) {
    const result = await this._gameService.attack(data);
    const oppositeWs = await this._webSocketService.getLinkedSocketByIndex(
      result.players.oppositeIndex,
    );
    const playerWs = await this._webSocketService.getLinkedSocketByIndex(
      result.players.playerIndex,
    );

    if (!result.success) {
      return this._turn(oppositeWs, playerWs, result.nextTurnIndex);
    }

    const {
      data: attackResult,
      killed,
      nextTurnIndex,
      winner,
      players: { playerIndex },
    } = result;

    await this._webSocketService.notify([
      [oppositeWs, MessageTypes.Attack, attackResult],
      [playerWs, MessageTypes.Attack, attackResult],
    ]);

    if (killed) {
      const { killedPoints, revealedPoints } = killed;
      // squash into 1 array and send for each message to oppWs and playerWs
      killedPoints.forEach(async (position) => {
        await this._webSocketService.notify([
          [
            oppositeWs,
            MessageTypes.Attack,
            { position, status: 'killed', currentPlayer: playerIndex },
          ],
          [
            playerWs,
            MessageTypes.Attack,
            { position, status: 'killed', currentPlayer: playerIndex },
          ],
        ]);
      });

      revealedPoints.forEach(async ({ x, y }) => {
        // await Promise.all()
        await this._webSocketService.notify([
          [
            oppositeWs,
            MessageTypes.Attack,
            { position: { x, y }, status: 'miss', currentPlayer: playerIndex },
          ],
          [
            playerWs,
            MessageTypes.Attack,
            { position: { x, y }, status: 'miss', currentPlayer: playerIndex },
          ],
        ]);
      });
    }

    if (winner) {
      // remove game by gameId
      return this._finish(oppositeWs, playerWs, winner);
    }

    await this._turn(oppositeWs, playerWs, nextTurnIndex);
  }

  private async _randomAttack(data: RandomAttackData) {
    await this._attack({
      ...data,
      x: getRandomInt(10),
      y: getRandomInt(10),
    });
  }

  private async _turn(
    playerWs1: WebSocket,
    playerWs2: WebSocket,
    currentPlayer: number,
  ): Promise<void> {
    const result = await this._gameService.turn(currentPlayer);

    await this._webSocketService.notify([
      [playerWs1, ...result],
      [playerWs2, ...result],
    ]);
  }

  private async _finish(playerWs1: WebSocket, playerWs2: WebSocket, winner: number): Promise<void> {
    await this._webSocketService.notify([
      [playerWs1, MessageTypes.Finish, { winPlayer: winner }],
      [playerWs2, MessageTypes.Finish, { winPlayer: winner }],
    ]);

    // await this._updateWinners();
  }

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
        return this._attack.bind(this, data);
      }
      case MessageTypes.RandomAttack: {
        return this._randomAttack.bind(this, data);
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

import {
  Room,
  CreateGameData,
  AddShipsData,
  AddShipsResult,
  Game,
  ShipPoint,
  AttackData,
  Ship,
  Player,
  StartGameResult,
  AttackResult,
  ShipTypes,
  ShipStatuses,
} from '@/types';
import { getRandomInt } from '@/utils';

export class GameService {
  private _games = new Map<number, Game>([]);
  private _gameIndex = 1;

  public async createGame(room: Room): Promise<CreateGameData[]> {
    const [player1, player2] = room.roomUsers;

    this._gameIndex += 1;

    this._games.set(this._gameIndex, {
      gameId: this._gameIndex,
      players: [
        {
          indexPlayer: player1.index,
          ships: [],
          shipsPoints: [],
          revealedPoints: [],
        },
        {
          indexPlayer: player2.index,
          ships: [],
          shipsPoints: [],
          revealedPoints: [],
        },
      ],
      turnIndex: player1.index,
    });

    return [
      { idGame: this._gameIndex, idPlayer: player1.index },
      { idGame: this._gameIndex, idPlayer: player2.index },
    ];
  }

  public async addShips({ gameId, ships, indexPlayer }: AddShipsData): Promise<AddShipsResult> {
    const game = this.getGameById(gameId);
    const player = this._getPlayerInGameByIndex(gameId, indexPlayer);

    player.ships = ships;
    player.shipsPoints = this._getShipsPoints(ships);

    const isGameReady = game.players.every((player) => player.ships.length > 0);
    const [player1, player2] = game.players;

    return {
      isGameReady,
      playersIndex: [player1.indexPlayer, player2.indexPlayer],
    };
  }

  public async startGame(gameId: number): Promise<StartGameResult> {
    const game = this.getGameById(gameId);
    const [player1, player2] = game.players;

    game.turnIndex = player1.indexPlayer;

    return {
      nextTurnIndex: game.turnIndex,
      players: [
        {
          currentPlayerIndex: player1.indexPlayer,
          ships: player1.ships,
        },
        {
          currentPlayerIndex: player2.indexPlayer,
          ships: player2.ships,
        },
      ],
    };
  }

  public async attack(
    { gameId, indexPlayer, x, y }: AttackData,
    isRandom: boolean,
  ): Promise<AttackResult> {
    const game = this.getGameById(gameId);
    const oppositePlayer = this.getOppositePlayerInGameByIndex(gameId, indexPlayer);
    const oppositeShip = oppositePlayer.shipsPoints.find((ship) =>
      ship.some((point) => point.x === x && point.y === y),
    );
    const shootingPoint = oppositeShip?.find((point) => point.x === x && point.y === y);
    const { revealedPoints } = oppositePlayer;
    const isAlreadyRevealed = revealedPoints.some((point) => point.x === x && point.y === y);
    const revealedPointsToSend: Omit<ShipPoint, 'killed'>[] = [];

    let status: ShipStatuses = ShipStatuses.Miss;

    if (game.turnIndex !== indexPlayer) {
      throw new Error('Not your turn');
    }

    game.turnIndex = oppositePlayer.indexPlayer;

    if (isAlreadyRevealed && !isRandom) {
      return {
        success: false,
        nextTurnIndex: game.turnIndex,
        players: { oppositeIndex: oppositePlayer.indexPlayer, playerIndex: indexPlayer },
      };
    }

    if (isAlreadyRevealed && isRandom) {
      while (true) {
        const randomPoint = { x: getRandomInt(10), y: getRandomInt(10) };

        if (
          !revealedPoints.some((point) => point.x === randomPoint.x && point.y === randomPoint.y)
        ) {
          game.turnIndex = indexPlayer;

          return this.attack({ gameId, indexPlayer, x: randomPoint.x, y: randomPoint.y }, false);
        }
      }
    }

    revealedPoints.push({ x, y });

    if (!shootingPoint) {
      status = ShipStatuses.Miss;
    }

    if (shootingPoint) {
      shootingPoint.killed = true;
      status = ShipStatuses.Shot;
    }

    const isShipKilled = oppositeShip?.every((point) => point.killed);

    if (isShipKilled) {
      status = ShipStatuses.Killed;

      revealedPointsToSend.push(
        ...this._revealCellsAroundShip(oppositeShip).filter(
          (point) => !revealedPoints.some((p) => p.x === point.x && p.y === point.y),
        ),
      );

      revealedPoints.push(
        ...oppositeShip!.map((p) => ({ x: p.x, y: p.y })),
        ...this._revealCellsAroundShip(oppositeShip),
      );
    }

    if (status === ShipStatuses.Killed || status === ShipStatuses.Shot) {
      game.turnIndex = indexPlayer;
    }

    return {
      success: true,
      players: { oppositeIndex: oppositePlayer.indexPlayer, playerIndex: indexPlayer },
      nextTurnIndex: game.turnIndex,
      data: {
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status,
      },
      killed: isShipKilled
        ? {
            killedPoints: oppositeShip || [],
            revealedPoints: revealedPointsToSend,
          }
        : null,
      winner: oppositePlayer.shipsPoints.every((sp) => sp.every((p) => p.killed))
        ? indexPlayer
        : null,
    };
  }

  public async deleteGame(gameId: number) {
    this._games.delete(gameId);
  }

  public async getGameDataByUserId(userId: number): Promise<Game | undefined> {
    return Array.from(this._games.values()).find((game) =>
      game.players.find((player) => player.indexPlayer === userId),
    );
  }

  private _revealCellsAroundShip(shipPoints?: ShipPoint[]) {
    if (!shipPoints) {
      throw new Error('No Ship Points');
    }

    const result: { x: number; y: number }[] = [];

    shipPoints.forEach(({ x, y }) => {
      const pointsAroundShip = [
        { x: x - 1, y: y - 1 },
        { x, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y },
        { x: x + 1, y },
        { x: x - 1, y: y + 1 },
        { x, y: y + 1 },
        { x: x + 1, y: y + 1 },
      ].filter(({ x, y }) => x >= 0 && x <= 9 && y >= 0 && y <= 9);

      pointsAroundShip.forEach((point) => {
        if (!result.some((p) => p.x === point.x && p.y === point.y)) {
          result.push(point);
        }
      });
    });

    return result.filter(({ x, y }) => !shipPoints.some((point) => point.x === x && point.y === y));
  }

  public getGameById(gameId: number): Game {
    const game = this._games.get(gameId);

    if (!game) {
      throw new Error('Game is not found');
    }

    return game;
  }

  private _getPlayerInGameByIndex(gameId: number, indexPlayer: number): Player {
    const game = this.getGameById(gameId);
    const player = game.players.find((player) => player.indexPlayer === indexPlayer);

    if (!player) {
      throw new Error('Player is not found');
    }

    return player;
  }

  public getOppositePlayerInGameByIndex(gameId: number, indexPlayer: number): Player {
    const game = this.getGameById(gameId);
    const player = game.players.find((player) => player.indexPlayer !== indexPlayer);

    if (!player) {
      throw new Error('Player is not found');
    }

    return player;
  }

  private _getShipsPoints(ships: Ship[]): ShipPoint[][] {
    return ships.map((ship) => {
      const { position, direction, length } = ship;

      const points = [];

      for (let i = 0; i < length; i += 1) {
        points.push(
          direction
            ? { x: position.x, y: position.y + i, killed: false }
            : { x: position.x + i, y: position.y, killed: false },
        );
      }

      return points;
    });
  }

  public getShipsLayout(): Ship[] {
    return [
      { position: { x: 1, y: 3 }, direction: false, type: ShipTypes.Huge, length: 4 },
      { position: { x: 3, y: 6 }, direction: true, type: ShipTypes.Large, length: 3 },
      { position: { x: 8, y: 4 }, direction: true, type: ShipTypes.Large, length: 3 },
      { position: { x: 7, y: 0 }, direction: true, type: ShipTypes.Medium, length: 2 },
      { position: { x: 3, y: 0 }, direction: true, type: ShipTypes.Medium, length: 2 },
      { position: { x: 0, y: 0 }, direction: true, type: ShipTypes.Medium, length: 2 },
      { position: { x: 7, y: 8 }, direction: true, type: ShipTypes.Small, length: 1 },
      { position: { x: 5, y: 0 }, direction: true, type: ShipTypes.Small, length: 1 },
      { position: { x: 9, y: 1 }, direction: false, type: ShipTypes.Small, length: 1 },
      { position: { x: 6, y: 3 }, direction: true, type: ShipTypes.Small, length: 1 },
    ];
  }
}

import {
  Room,
  CreateGameData,
  AddShipsData,
  AddShipsResult,
  Game,
  PlayerInGame,
  ShipPoint,
  AttackData,
  Ship,
  Player,
} from '@/types';

export class GameService {
  private _games: Game[] = [];
  private _gameIndex = 1;

  public async createGame(room: Room): Promise<CreateGameData[]> {
    const [user1, user2] = room.roomUsers;

    this._gameIndex += 1;

    this._games.push({
      started: false,
      gameId: this._gameIndex,
      players: [
        {
          indexPlayer: user1.index,
          ships: [],
          shipsPoints: [],
        },
        {
          indexPlayer: user2.index,
          ships: [],
          shipsPoints: [],
        },
      ],
    });

    return [
      { idGame: this._gameIndex, idPlayer: user1.index },
      { idGame: this._gameIndex, idPlayer: user2.index },
    ];
  }

  public async addShips({ gameId, ships, indexPlayer }: AddShipsData): Promise<AddShipsResult> {
    const game = this._getGameById(gameId);
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

  public async startGame(gameId: number): Promise<PlayerInGame[]> {
    const game = this._getGameById(gameId);
    const [player1, player2] = game.players;

    game.started = true;

    return [
      {
        currentPlayerIndex: player1.indexPlayer,
        ships: player1.ships,
      },
      {
        currentPlayerIndex: player2.indexPlayer,
        ships: player2.ships,
      },
    ];
  }

  public async attack({ gameId, indexPlayer, x, y }: AttackData) {
    const player = this._getOppositePlayerInGameByIndex(gameId, indexPlayer);
    const ship = player.shipsPoints.find((ship) =>
      ship.some((point) => point.x === x && point.y === y),
    );
    const point = ship?.find((point) => point.x === x && point.y === y);

    let status: 'miss' | 'killed' | 'shot' = 'miss';
    let turnIndex = indexPlayer;

    if (!point || !ship) {
      status = 'miss';
      turnIndex = player.indexPlayer;
    }

    if (point) {
      point.killed = true;
      status = 'shot';
      turnIndex = indexPlayer;
    }

    const killed = ship?.every((point) => point.killed);

    if (killed) {
      status = 'killed';
      turnIndex = indexPlayer;
      console.log(this._revealCellsAroundShip(ship!));
    }

    return {
      playerIndexes: [player.indexPlayer, indexPlayer],
      turnIndex,
      data: {
        position: {
          x,
          y,
        },
        currentPlayer: indexPlayer,
        status,
      },
      killed: status === 'killed',
      winner: player.shipsPoints.every((sp) => sp.every((p) => p.killed)) ? indexPlayer : 0,
      revealPoints: this._revealCellsAroundShip(ship!),
    };
  }

  public async turn() {
    // TODO: if currentPlayerIndex !== indexPlayer => just return
  }

  private _revealCellsAroundShip(shipPoints: ShipPoint[]) {
    const result: { x: number; y: number }[] = [];

    shipPoints.forEach(({ x, y }) => {
      const pointsAroundShip = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y + 1 },
      ].filter(({ x, y }) => x >= 0 && x <= 9 && y >= 0 && y <= 9);

      pointsAroundShip.forEach((point) => {
        if (!result.includes(point)) result.push(point);
      });
    });

    return result.filter(({ x, y }) => !shipPoints.some((point) => point.x === x && point.y === y));
  }

  private _getGameById(gameId: number): Game {
    const game = this._games.find((game) => game.gameId === gameId);

    if (!game) {
      throw new Error('Game is not found');
    }

    return game;
  }

  private _getPlayerInGameByIndex(gameId: number, indexPlayer: number): Player {
    const game = this._getGameById(gameId);
    const player = game.players.find((player) => player.indexPlayer === indexPlayer);

    if (!player) {
      throw new Error('Player is not found');
    }

    return player;
  }

  private _getOppositePlayerInGameByIndex(gameId: number, indexPlayer: number): Player {
    const game = this._getGameById(gameId);
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
}

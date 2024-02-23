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
} from '@/types';

export class GameService {
  private _games: Game[] = [];
  private _gameIndex = 1;

  public async createGame(room: Room): Promise<CreateGameData[]> {
    const [player1, player2] = room.roomUsers;

    this._gameIndex += 1;

    this._games.push({
      gameId: this._gameIndex,
      players: [
        {
          indexPlayer: player1.index,
          ships: [],
          shipsPoints: [],
        },
        {
          indexPlayer: player2.index,
          ships: [],
          shipsPoints: [],
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

  public async startGame(gameId: number): Promise<StartGameResult> {
    const game = this._getGameById(gameId);
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

  public async attack({ gameId, indexPlayer, x, y }: AttackData) {
    const game = this._getGameById(gameId);

    if (game.turnIndex !== indexPlayer) {
      throw new Error('Cannot attack on the wrong turn');
    }

    const oppositePlayer = this._getOppositePlayerInGameByIndex(gameId, indexPlayer);
    const oppositeShip = oppositePlayer.shipsPoints.find((ship) =>
      ship.some((point) => point.x === x && point.y === y),
    );

    const shootingPoint = oppositeShip?.find((point) => point.x === x && point.y === y);

    let status: 'miss' | 'killed' | 'shot' = 'miss';

    game.turnIndex = oppositePlayer.indexPlayer;

    if (!shootingPoint) {
      status = 'miss';
    }

    // if already killed or revealed - do nothing?
    if (shootingPoint) {
      shootingPoint.killed = true;
      status = 'shot';
    }

    const isShipKilled = oppositeShip?.every((point) => point.killed);

    if (isShipKilled) {
      status = 'killed';
    }

    if (status === 'killed' || status === 'shot') {
      game.turnIndex = indexPlayer;
    }

    const isWinner = oppositePlayer.shipsPoints.every((sp) => sp.every((p) => p.killed));

    return {
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
            revealedPoints: this._revealCellsAroundShip(oppositeShip),
          }
        : null,
      winner: isWinner ? indexPlayer : null,
    };
  }

  public async turn() {
    // TODO: if currentPlayerIndex !== indexPlayer => just return
  }

  private _revealCellsAroundShip(shipPoints?: ShipPoint[]) {
    if (!shipPoints) {
      throw new Error('No Ship Points');
    }

    // try Set?
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
    // removing ship points (ship itself)
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

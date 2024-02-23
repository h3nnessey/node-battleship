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
  MessageTypes,
  AttackResult,
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

  public async attack({ gameId, indexPlayer, x, y }: AttackData): Promise<AttackResult> {
    const game = this._getGameById(gameId);
    const oppositePlayer = this._getOppositePlayerInGameByIndex(gameId, indexPlayer);
    const oppositeShip = oppositePlayer.shipsPoints.find((ship) =>
      ship.some((point) => point.x === x && point.y === y),
    );
    const shootingPoint = oppositeShip?.find((point) => point.x === x && point.y === y);
    const { revealedPoints } = oppositePlayer;
    const isAlreadyRevealed = revealedPoints.some((point) => point.x === x && point.y === y);
    let revealedPointsToSend: { x: number; y: number }[] = [];

    let status: 'miss' | 'killed' | 'shot' = 'miss';

    // todo: handle wrong turnIndex for current game.turnIndex

    if (isAlreadyRevealed) {
      // or pass turn to the opposite player
      return {
        success: false,
        nextTurnIndex: indexPlayer,
        players: { oppositeIndex: oppositePlayer.indexPlayer, playerIndex: indexPlayer },
      };
    }

    if (!shootingPoint) {
      status = 'miss';
      game.turnIndex = oppositePlayer.indexPlayer;
      revealedPoints.push({ x, y });
    }

    if (shootingPoint) {
      shootingPoint.killed = true;
      status = 'shot';
      revealedPoints.push({ x, y });
    }

    const isShipKilled = oppositeShip?.every((point) => point.killed);

    if (isShipKilled) {
      status = 'killed';

      revealedPointsToSend = this._revealCellsAroundShip(oppositeShip).filter(
        (point) => !revealedPoints.some((p) => p.x === point.x && p.y === point.y),
      );

      revealedPoints.push(
        ...oppositeShip!.map((p) => ({ x: p.x, y: p.y })),
        ...this._revealCellsAroundShip(oppositeShip),
      );
    }

    if (status === 'killed' || status === 'shot') {
      game.turnIndex = indexPlayer;
      revealedPoints.push({ x, y });
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

  public async turn(currentPlayer: number): Promise<[string, { currentPlayer: number }]> {
    return [MessageTypes.Turn, { currentPlayer }];
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

import { Room, CreateGameData, AddShipsData, AddShipsResult, Game, PlayerInGame } from '@/types';

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
        },
        {
          indexPlayer: user2.index,
          ships: [],
        },
      ],
    });

    return [
      { idGame: this._gameIndex, idPlayer: user1.index },
      { idGame: this._gameIndex, idPlayer: user2.index },
    ];
  }

  public async addShips({ gameId, ships, indexPlayer }: AddShipsData): Promise<AddShipsResult> {
    const game = this._games.find((game) => game.gameId === gameId);
    const player = game?.players.find((player) => player.indexPlayer === indexPlayer);

    if (!game || !player) {
      throw new Error('Failed to add ships');
    }

    player.ships = ships;

    const isGameReady = game.players.every((player) => player.ships.length > 0);
    const [player1, player2] = game.players;

    return isGameReady
      ? {
          isGameReady: true,
          playersIndex: [player1.indexPlayer, player2.indexPlayer],
        }
      : {
          isGameReady: false,
        };
  }

  public async startGame(gameId: number): Promise<PlayerInGame[]> {
    const game = this._games.find((game) => game.gameId === gameId);

    if (!game) {
      throw new Error('startGame: Game is not found');
    }

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
}

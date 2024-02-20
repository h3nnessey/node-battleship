import { Room, CreateGameData, AddShipsData, AddShipsResult, Game, StartGameResult } from '@/types';

export class GameService {
  private _gameIndex = 0;
  private _games: Game[] = [];

  public async createGame(room: Room): Promise<CreateGameData[] | undefined> {
    const user1 = room.roomUsers.at(0);
    const user2 = room.roomUsers.at(1);

    if (user1 && user2) {
      this._gameIndex += 1;

      const data = [
        { idGame: this._gameIndex, idPlayer: user1.index },
        { idGame: this._gameIndex, idPlayer: user2.index },
      ];

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

      return data;
    }
  }

  public async addShips({
    gameId,
    ships,
    indexPlayer,
  }: AddShipsData): Promise<AddShipsResult | undefined> {
    const game = this._games.find((game) => game.gameId === gameId);
    const player = game?.players.find((player) => player.indexPlayer === indexPlayer);

    if (game && player) {
      player.ships = ships;
      const isGameReady = game.players.every((player) => player.ships.length > 0);

      return isGameReady
        ? {
            isGameReady: true,
            playersIndex: game.players.map((player) => player.indexPlayer) as [number, number],
          }
        : {
            isGameReady: false,
          };
    }
  }

  public async startGame(gameId: number): Promise<StartGameResult | undefined> {
    const game = this._games.find((game) => game.gameId === gameId);
    const players = game?.players;
    const player1 = players?.at(0);
    const player2 = players?.at(1);

    if (player1 && player2 && game) {
      game.started = true;

      return {
        player1: {
          currentPlayerIndex: player1.indexPlayer,
          ships: player1.ships,
        },
        player2: {
          currentPlayerIndex: player2.indexPlayer,
          ships: player2.ships,
        },
      };
    }
  }
}

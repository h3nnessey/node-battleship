import { Room, CreateGameData } from '@/types';

export class GameService {
  private _gameIndex = 0;
  private _games: { gameId: number }[] = [];

  public async createGame(room: Room): Promise<CreateGameData[] | undefined> {
    const user1 = room.roomUsers.at(0);
    const user2 = room.roomUsers.at(1);

    if (user1 && user2) {
      this._gameIndex += 1;

      const data = [
        { idGame: this._gameIndex, idPlayer: user1.index },
        { idGame: this._gameIndex, idPlayer: user2.index },
      ];

      this._games.push({ gameId: this._gameIndex });

      return data;
    }
  }
}

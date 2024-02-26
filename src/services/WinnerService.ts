import { UserPublicData, Winner } from '@/types';

export class WinnerService {
  private readonly _winners = new Map<number, Winner>([]);

  public async getWinners(): Promise<Winner[]> {
    return Array.from(this._winners.values());
  }

  public async addWinner({ name, index }: UserPublicData): Promise<void> {
    const isExists = this._winners.has(index);

    if (isExists) {
      const winner = this._winners.get(index)!;

      this._winners.set(index, { ...winner, wins: winner.wins + 1 });
    } else {
      this._winners.set(index, { name, wins: 1 });
    }
  }
}

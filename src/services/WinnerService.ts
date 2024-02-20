import { Winner } from '@/types';

export class WinnerService {
  private readonly _winners: Winner[] = [];

  public async getWinners(): Promise<Winner[]> {
    return this._winners;
  }
}

import { Room, UserPublicData } from '@/types';

// delete room when user closing tab etc.
export class RoomService {
  private _rooms: Room[] = [];
  private _currentIndex = 0;

  public async getRooms(): Promise<Room[]> {
    return this._rooms.filter((room) => room.roomUsers.length === 1);
  }

  public async createRoom(user: UserPublicData): Promise<void> {
    const newRoom = {
      roomId: this._currentIndex++,
      roomUsers: [user],
    };

    this._rooms.push(newRoom);
  }

  public async addUserToRoom(user: UserPublicData, roomId: number): Promise<Room | undefined> {
    const room = this._rooms.find((room) => room.roomId === roomId);

    if (room) {
      room.roomUsers.push(user);
      this._rooms = this._rooms.filter((room) => roomId !== room.roomId);
      return room;
    }
  }
}

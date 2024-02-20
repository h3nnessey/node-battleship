import { Room, UserPublicData } from '@/types';

export class RoomService {
  private _rooms: Room[] = [];
  private _currentIndex = 0;

  public async getRooms(): Promise<Room[]> {
    return this._rooms.filter((room) => room.roomUsers.length === 1);
  }

  public async createRoom(user: UserPublicData) {
    const newRoom = {
      roomId: this._currentIndex++,
      roomUsers: [user],
    };

    this._rooms.push(newRoom);
  }

  public async addUserToRoom(user: UserPublicData, roomId: number) {
    const room = this._rooms.find((room) => room.roomId === roomId);

    if (room) {
      room.roomUsers.push(user);
    }
  }
}

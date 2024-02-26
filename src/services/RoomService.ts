import { Room, UserPublicData } from '@/types';

export class RoomService {
  private _rooms: Room[] = [];
  private _currentIndex = 1;

  public async getRooms(): Promise<Room[]> {
    return this._rooms.filter((room) => room.roomUsers.length === 1);
  }

  public async createRoom(user?: UserPublicData, isSinglePlay = false): Promise<Room> {
    if (!user) {
      throw new Error('User not found');
    }

    const isUserAlreadyCreatedRoom = await this._isUserHasRoom(user.name);

    if (isUserAlreadyCreatedRoom && !isSinglePlay) {
      throw new Error('User already created room');
    }

    const newRoom = {
      roomId: this._currentIndex++,
      roomUsers: [user],
    };

    this._rooms.push(newRoom);

    return newRoom;
  }

  public async addUserToRoom(roomId: number, user?: UserPublicData): Promise<Room> {
    const room = this._rooms.find((room) => room.roomId === roomId);

    if (!room || !user) {
      throw new Error('Failed to add user to room');
    }

    const isUserAlreadyInRoom = room.roomUsers.some((u) => u.name === user.name);

    if (isUserAlreadyInRoom) {
      throw new Error('Cannot join room twice');
    }

    room.roomUsers.push(user);

    const [player1, player2] = room.roomUsers;

    this._rooms = this._rooms.filter(
      (room) =>
        roomId !== room.roomId &&
        !room.roomUsers.some((u) => u.name === player1.name || u.name === player2.name),
    );

    return room;
  }

  public async deleteUserRoom(name: string): Promise<void> {
    this._rooms = this._rooms.filter((room) => room.roomUsers.some((user) => user.name !== name));
  }

  private async _isUserHasRoom(name: string): Promise<boolean> {
    return this._rooms.some((room) => room.roomUsers.some((user) => user.name === name));
  }
}

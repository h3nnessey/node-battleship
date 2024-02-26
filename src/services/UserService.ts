import { WebSocketService } from '@/services';
import { RegisterUserRequestData, RegisterUserResponseData, User } from '@/types';

export class UserService {
  private readonly _websocketService = new WebSocketService();
  private readonly _users: User[] = [];
  private _currentIndex = 1;

  public async registerUser(
    { name, password }: RegisterUserRequestData,
    isBot = false,
  ): Promise<RegisterUserResponseData> {
    try {
      const userIndex = await this._getUserIndex({ name, password });

      if (userIndex !== null) {
        return this._loginUser(userIndex);
      }

      return this._addUser({ name, password }, isBot);
    } catch (error) {
      return {
        name: name,
        index: this._currentIndex,
        error: true,
        errorText: error instanceof Error ? error.message : 'Invalid Credentials',
      };
    }
  }

  private async _getUserIndex({ name, password }: RegisterUserRequestData): Promise<number | null> {
    const userIndex = this._users.findIndex((user) => user.name === name);
    const isValidPassword = userIndex !== -1 && this._users[userIndex].password === password;

    if (userIndex === -1) return null;

    if (!isValidPassword) {
      throw new Error('Invalid Password');
    }

    return userIndex;
  }

  private async _addUser(
    { name, password }: RegisterUserRequestData,
    isBot: boolean,
  ): Promise<RegisterUserResponseData> {
    const newUser = { name, password, index: this._currentIndex++, isBot };

    this._users.push(newUser);

    return {
      name: name,
      index: newUser.index,
      error: false,
      errorText: '',
    };
  }

  private async _loginUser(index: number): Promise<RegisterUserResponseData> {
    const user = this._users[index];
    const isUserOnline = await this._isUserOnline(user.name);

    return {
      name: user.name,
      index: user.index,
      error: isUserOnline,
      errorText: isUserOnline ? 'User is already online' : '',
    };
  }
  private async _isUserOnline(name: string): Promise<boolean> {
    try {
      await this._websocketService.getLinkedSocketByName(name);

      return true;
    } catch {
      return false;
    }
  }
}

import { RegisterUserRequestData, RegisterUserResponseData, User } from '@/types';

export class UserService {
  private readonly _users: User[] = [];
  private _currentIndex = 0;

  public async registerUser({
    name,
    password,
  }: RegisterUserRequestData): Promise<RegisterUserResponseData> {
    try {
      const userIndex = this._getUserIndex({ name, password });

      if (userIndex !== null) {
        return this._loginUser(userIndex);
      }

      return this._addUser({ name, password });
    } catch (error) {
      return {
        name: name,
        index: this._currentIndex,
        error: true,
        errorText: error instanceof Error ? error.message : 'Invalid Credentials',
      };
    }
  }

  private _getUserIndex({ name, password }: RegisterUserRequestData): number | null {
    const userIndex = this._users.findIndex((user) => user.name === name);
    const isValidPassword = userIndex !== -1 && this._users[userIndex].password === password;

    if (userIndex === -1) return null;

    if (!isValidPassword) {
      throw new Error('Invalid Password');
    }

    return userIndex;
  }

  private _addUser({ name, password }: RegisterUserRequestData): RegisterUserResponseData {
    const newUser = { name, password, index: this._currentIndex++ };

    this._users.push(newUser);

    return {
      name: name,
      index: newUser.index,
      error: false,
      errorText: '',
    };
  }

  private _loginUser(index: number): RegisterUserResponseData {
    const user = this._users[index];

    return {
      name: user.name,
      index: user.index,
      error: false,
      errorText: '',
    };
  }
}

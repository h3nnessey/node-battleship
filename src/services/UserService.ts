import { RegisterUserRequestData, RegisterUserResponseData } from '@/types';

export class UserService {
  private readonly _users: { name: string; password: string; index: number }[] = [];
  private currentIndex = 0;

  async registerUser(data: RegisterUserRequestData): Promise<RegisterUserResponseData> {
    this.currentIndex += 1;

    this._users.push({ ...data, index: this.currentIndex });

    return {
      name: data.name,
      index: this.currentIndex,
      error: false,
      errorText: '',
    };
  }
}

export enum WsMessageTypes {
  Reg = 'reg',
  UpdateWinners = 'update_winners',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish',
}

export enum WsControllerMethodNames {
  RegisterUser = 'registerUser',
  UpdateWinners = 'updateWinners',
  CreateRoom = 'createRoom',
  AddUserToRoom = 'addUserToRoom',
  CreateGame = 'createGame',
  UpdateRoom = 'updateRoom',
  AddShips = 'addShips',
  StartGame = 'startGame',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish',
}

export interface WsControllerInterface {
  [WsControllerMethodNames.RegisterUser](): void;
  [WsControllerMethodNames.UpdateWinners](): void;
  [WsControllerMethodNames.CreateRoom](): void;
  [WsControllerMethodNames.AddUserToRoom](): void;
  [WsControllerMethodNames.CreateGame](): void;
  [WsControllerMethodNames.UpdateRoom](): void;
  [WsControllerMethodNames.AddShips](): void;
  [WsControllerMethodNames.StartGame](): void;
  [WsControllerMethodNames.Attack](): void;
  [WsControllerMethodNames.RandomAttack](): void;
  [WsControllerMethodNames.Turn](): void;
  [WsControllerMethodNames.Finish](): void;
}

export interface WsMessage<T extends WsMessageTypes, D> {
  type: T;
  data: D;
  id: 0;
}

export interface RegisterUserRequestData {
  name: string;
  password: string;
}

export interface RegisterUserResponseData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export type RegisterUserData = RegisterUserRequestData | RegisterUserResponseData;

export interface WinnerData {
  name: string;
  wins: number;
}

export interface AvailableRoomData {
  roomId: number;
  roomUsers: Pick<RegisterUserResponseData, 'name' | 'index'>[];
}

export interface AddUserToRoomData {
  indexRoom: number;
}

export interface CreateGameData {
  idGame: number;
  idPlayer: number;
}

export interface AttackData {
  gameId: number;
  indexPlayer: number;
  x: number;
  y: number;
}

export interface RandomAttackData {
  gameId: number;
  indexPlayer: number;
}

export interface TurnData {
  currentPlayer: number;
}

export interface FinishData {
  winPlayer: number;
}

// TODO: add AddShips & StartGame types
export type WsMessages =
  | WsMessage<WsMessageTypes.Reg, RegisterUserData>
  | WsMessage<WsMessageTypes.UpdateWinners, WinnerData[]>
  | WsMessage<WsMessageTypes.CreateRoom, string>
  | WsMessage<WsMessageTypes.AddUserToRoom, AddUserToRoomData>
  | WsMessage<WsMessageTypes.CreateGame, CreateGameData>
  | WsMessage<WsMessageTypes.UpdateRoom, AvailableRoomData[]>
  | WsMessage<WsMessageTypes.AddShips, number>
  | WsMessage<WsMessageTypes.StartGame, number>
  | WsMessage<WsMessageTypes.Attack, AttackData>
  | WsMessage<WsMessageTypes.RandomAttack, RandomAttackData>
  | WsMessage<WsMessageTypes.Turn, TurnData>
  | WsMessage<WsMessageTypes.Finish, FinishData>;

export const WsControllerMethodNamesMap = new Map<WsMessageTypes, WsControllerMethodNames>([
  [WsMessageTypes.Reg, WsControllerMethodNames.RegisterUser],
  [WsMessageTypes.UpdateWinners, WsControllerMethodNames.UpdateWinners],
  [WsMessageTypes.CreateRoom, WsControllerMethodNames.CreateRoom],
  [WsMessageTypes.AddUserToRoom, WsControllerMethodNames.AddUserToRoom],
  [WsMessageTypes.CreateGame, WsControllerMethodNames.CreateGame],
  [WsMessageTypes.UpdateRoom, WsControllerMethodNames.UpdateRoom],
  [WsMessageTypes.AddShips, WsControllerMethodNames.AddShips],
  [WsMessageTypes.StartGame, WsControllerMethodNames.StartGame],
  [WsMessageTypes.Attack, WsControllerMethodNames.Attack],
  [WsMessageTypes.RandomAttack, WsControllerMethodNames.RandomAttack],
  [WsMessageTypes.Turn, WsControllerMethodNames.Turn],
  [WsMessageTypes.Finish, WsControllerMethodNames.Finish],
]);

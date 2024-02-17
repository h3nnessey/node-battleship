export enum MessageTypes {
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

export interface AddShipsData {
  gameId: number;
  indexPlayer: number;
}

export interface StartGameData {
  gameId: number;
  indexPlayer: number;
}

export interface BaseMessage {
  id: 0;
}

export interface RegisterUserRequestMessage extends BaseMessage {
  type: MessageTypes.Reg;
  data: RegisterUserRequestData;
}

export interface RegisterUserResponseMessage extends BaseMessage {
  type: MessageTypes.Reg;
  data: RegisterUserResponseData;
}

export interface UpdateWinnersMessage extends BaseMessage {
  type: MessageTypes.UpdateWinners;
  data: WinnerData[];
}

export interface UpdateRoomMessage extends BaseMessage {
  type: MessageTypes.UpdateRoom;
  data: AvailableRoomData[];
}

export interface CreateRoomMessage extends BaseMessage {
  type: MessageTypes.CreateRoom;
  data: string;
}

export interface AddUserToRoomMessage extends BaseMessage {
  type: MessageTypes.AddUserToRoom;
  data: AddUserToRoomData;
}

export interface CreateGameMessage extends BaseMessage {
  type: MessageTypes.CreateGame;
  data: CreateGameData;
}

export interface AddShipsMessage extends BaseMessage {
  type: MessageTypes.AddShips;
  data: AddShipsData;
}

export interface StartGameMessage extends BaseMessage {
  type: MessageTypes.StartGame;
  data: StartGameData;
}

export interface AttackMessage extends BaseMessage {
  type: MessageTypes.Attack;
  data: AttackData;
}

export interface RandomAttackMessage extends BaseMessage {
  type: MessageTypes.RandomAttack;
  data: RandomAttackData;
}

export type RequestMessages =
  | RegisterUserRequestMessage
  | CreateRoomMessage
  | AddUserToRoomMessage
  | AttackMessage
  | RandomAttackMessage
  | AddShipsMessage;

import type { WebSocket } from 'ws';

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
  SinglePlay = 'single_play',
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

export interface Winner {
  name: string;
  wins: number;
}

export interface Room {
  roomId: number;
  roomUsers: UserPublicData[];
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

export type AttackResult = AttackSuccessData | AttackFailData;

export interface AttackFailData {
  success: false;
  nextTurnIndex: number;
  players: {
    oppositeIndex: number;
    playerIndex: number;
  };
}

export interface AttackSuccessData {
  success: true;
  players: {
    oppositeIndex: number;
    playerIndex: number;
  };
  nextTurnIndex: number;
  data: {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number;
    status: 'miss' | 'killed' | 'shot';
  };
  killed: {
    killedPoints: ShipPoint[];
    revealedPoints: { x: number; y: number }[];
  } | null;
  winner: number | null;
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
  ships: Ship[];
  indexPlayer: number;
}

export interface Player {
  indexPlayer: number;
  ships: Ship[];
  shipsPoints: ShipPoint[][];
  revealedPoints: { x: number; y: number }[];
}

export interface ShipPoint {
  x: number;
  y: number;
  killed: boolean;
}

export interface Game {
  gameId: number;
  players: Player[];
  turnIndex: number;
}

export interface StartGameResult {
  nextTurnIndex: number;
  players: PlayerInGame[];
}

export interface PlayerInGame {
  currentPlayerIndex: number;
  ships: Ship[];
}

export interface AddShipsResult {
  isGameReady: boolean;
  playersIndex: [number, number];
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
  data: Winner[];
}

export interface UpdateRoomMessage extends BaseMessage {
  type: MessageTypes.UpdateRoom;
  data: Room[];
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

export interface SinglePlayMessage extends BaseMessage {
  type: MessageTypes.SinglePlay;
  data: string;
}

export interface TurnMessage extends BaseMessage {
  type: MessageTypes.Turn;
  data: TurnData;
}

export interface FinishMessage extends BaseMessage {
  type: MessageTypes.Finish;
  data: FinishData;
}

export type RequestMessages =
  | RegisterUserRequestMessage
  | CreateRoomMessage
  | AddUserToRoomMessage
  | AttackMessage
  | RandomAttackMessage
  | AddShipsMessage
  | SinglePlayMessage
  | TurnMessage;

export interface UserPublicData {
  name: string;
  index: number;
}

export interface User extends UserPublicData {
  password: string;
}

export enum ShipTypes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export interface Ship {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipTypes;
}

export type NotifyArgs = [ws: WebSocket, type: string, data: unknown][];

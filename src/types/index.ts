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

export enum WsControllerMethods {
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
  [WsControllerMethods.RegisterUser](): void;
  [WsControllerMethods.UpdateWinners](): void;
  [WsControllerMethods.CreateRoom](): void;
  [WsControllerMethods.AddUserToRoom](): void;
  [WsControllerMethods.CreateGame](): void;
  [WsControllerMethods.UpdateRoom](): void;
  [WsControllerMethods.AddShips](): void;
  [WsControllerMethods.StartGame](): void;
  [WsControllerMethods.Attack](): void;
  [WsControllerMethods.RandomAttack](): void;
  [WsControllerMethods.Turn](): void;
  [WsControllerMethods.Finish](): void;
}

export const WsControllerMethodsMap = new Map<WsMessageTypes, WsControllerMethods>([
  [WsMessageTypes.Reg, WsControllerMethods.RegisterUser],
  [WsMessageTypes.UpdateWinners, WsControllerMethods.UpdateWinners],
  [WsMessageTypes.CreateRoom, WsControllerMethods.CreateRoom],
  [WsMessageTypes.AddUserToRoom, WsControllerMethods.AddUserToRoom],
  [WsMessageTypes.CreateGame, WsControllerMethods.CreateGame],
  [WsMessageTypes.UpdateRoom, WsControllerMethods.UpdateRoom],
  [WsMessageTypes.AddShips, WsControllerMethods.AddShips],
  [WsMessageTypes.StartGame, WsControllerMethods.StartGame],
  [WsMessageTypes.Attack, WsControllerMethods.Attack],
  [WsMessageTypes.RandomAttack, WsControllerMethods.RandomAttack],
  [WsMessageTypes.Turn, WsControllerMethods.Turn],
  [WsMessageTypes.Finish, WsControllerMethods.Finish],
]);

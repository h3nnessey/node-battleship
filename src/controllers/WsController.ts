import { WsMessageTypes, WsControllerInterface, WsControllerMethodsMap } from '@/types';

export class WsController implements WsControllerInterface {
  registerUser() {
    // data: unknown?
    // can validate data on service layer probably?
  }

  updateWinners() {}

  createRoom() {}

  addUserToRoom() {}

  createGame() {}

  updateRoom() {}

  addShips() {}

  startGame() {}

  attack() {}

  randomAttack() {}

  turn() {}

  finish() {}

  // message: { type, data, id }
  exec(type: string) {
    try {
      // const { type, data, id } = this._parseMessage(message);

      const method = this._getMethod(type);

      this[method]();
    } catch (error) {
      console.log(error);
    }
  }

  private _parseMessage(message: string) {
    return JSON.parse(message);
  }

  private _getMethod(type: string) {
    const method = WsControllerMethodsMap.get(type as WsMessageTypes);

    if (!method) {
      throw new Error('Invalid message type');
    }

    return method;
  }
}

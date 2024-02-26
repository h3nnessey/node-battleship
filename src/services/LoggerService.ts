export class LoggerService {
  private static instance: LoggerService;

  constructor() {
    if (!LoggerService.instance) {
      LoggerService.instance = this;
    }

    return LoggerService.instance;
  }

  public logIncomingMessage(address: string, data: unknown) {
    this._log(`[INCOMING MESSAGE | ${address}]`, data);
  }

  public logErrorMessage(address: string, error: unknown) {
    this._log(
      `[ERROR | ${address}]`,
      error instanceof Error ? error.message : 'Internal Server Error',
    );
  }

  public logNewConnection(address: string) {
    this._log(`[NEW CONNECTION | ${address}]`);
  }

  public logConnectionClosed(address: string) {
    this._log(`[CONNECTION CLOSED | ${address}]`);
  }

  public logOutgoingMessage(address: string, data: unknown) {
    this._log(`[OUTGOING MESSAGE | ${address}]`, data);
  }

  private _log(message: string, ...args: unknown[]) {
    console.log(message, ...args);
  }
}

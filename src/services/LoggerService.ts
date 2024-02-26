import { inspect } from 'node:util';
import { Colors, colorize } from '@/utils';

export class LoggerService {
  private static instance: LoggerService;

  constructor() {
    if (!LoggerService.instance) {
      LoggerService.instance = this;
    }

    return LoggerService.instance;
  }

  public logIncomingMessage(address: string, data: unknown) {
    const message = colorize(`[INCOMING MESSAGE | ${address}]`, Colors.Green);

    console.log(
      message,
      inspect(data, { depth: null, showHidden: false, colors: true, compact: true }),
    );
  }

  public logErrorMessage(address: string, error: unknown) {
    const message = colorize(`[ERROR | ${address}]`, Colors.Red);

    this._log(message, error instanceof Error ? error.message : 'Internal Server Error');
  }

  public logNewConnection(address: string) {
    const message = colorize(`[NEW CONNECTION | ${address}]`, Colors.Yellow);

    this._log(message);
  }

  public logConnectionClosed(address: string) {
    const message = colorize(`[CONNECTION CLOSED | ${address}]`, Colors.Cyan);

    this._log(message);
  }

  public logOutgoingMessage(address: string, data: unknown) {
    const message = colorize(`[OUTGOING MESSAGE | ${address}]`, Colors.Magenta);

    console.log(
      message,
      inspect(data, { depth: null, showHidden: false, colors: true, compact: true }),
    );
  }

  private _log(message: string, ...args: unknown[]) {
    console.log(message, ...args);
  }
}

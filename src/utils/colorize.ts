export enum Colors {
  Red = '31',
  Green = '32',
  Yellow = '33',
  Magenta = '35',
  Cyan = '36',
}

export const colorize = (str: string, color: Colors) => `\x1b[${color}m${str}\x1b[0m`;

const SERIALIZERS_MAP = new Map([
  ['object', JSON.stringify],
  ['function', JSON.stringify],
  ['bigint', (num: bigint) => num.toString()],
  ['boolean', (bool: boolean) => bool.toString()],
  ['number', (num: number) => num.toString()],
  ['string', (str: string) => str],
]);

export const getSerializer = (typeofValue: string) => {
  return SERIALIZERS_MAP.get(typeofValue) || JSON.stringify;
};

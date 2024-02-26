import { ShipTypes } from '@/types';

export const WS_SERVER_PORT = 3000;
export const WS_SERVER_HOST = 'localhost';
export const WS_SERVER_URL = `ws://${WS_SERVER_HOST}:${WS_SERVER_PORT}`;
export const BOT_NAME_PREFIX = 'BOT_';
export const BOT_PASSWORD = '12345';
export const SHIPS = [
  [
    { position: { x: 7, y: 4 }, direction: true, type: ShipTypes.Huge, length: 4 },
    { position: { x: 2, y: 2 }, direction: true, type: ShipTypes.Large, length: 3 },
    { position: { x: 5, y: 2 }, direction: false, type: ShipTypes.Large, length: 3 },
    { position: { x: 1, y: 8 }, direction: false, type: ShipTypes.Medium, length: 2 },
    { position: { x: 4, y: 6 }, direction: false, type: ShipTypes.Medium, length: 2 },
    { position: { x: 1, y: 6 }, direction: false, type: ShipTypes.Small, length: 1 },
    { position: { x: 0, y: 0 }, direction: false, type: ShipTypes.Small, length: 1 },
    { position: { x: 6, y: 0 }, direction: false, type: ShipTypes.Small, length: 1 },
    { position: { x: 4, y: 8 }, direction: false, type: ShipTypes.Small, length: 1 },
    { position: { x: 4, y: 4 }, direction: false, type: ShipTypes.Medium, length: 2 },
  ],
  [
    { position: { x: 0, y: 0 }, direction: false, type: ShipTypes.Huge, length: 4 },
    { position: { x: 0, y: 9 }, direction: false, type: ShipTypes.Large, length: 3 },
    { position: { x: 1, y: 6 }, direction: false, type: ShipTypes.Large, length: 3 },
    { position: { x: 1, y: 3 }, direction: false, type: ShipTypes.Medium, length: 2 },
    { position: { x: 4, y: 3 }, direction: true, type: ShipTypes.Medium, length: 2 },
    { position: { x: 5, y: 7 }, direction: true, type: ShipTypes.Small, length: 1 },
    { position: { x: 6, y: 1 }, direction: true, type: ShipTypes.Small, length: 1 },
    { position: { x: 8, y: 4 }, direction: true, type: ShipTypes.Small, length: 1 },
    { position: { x: 7, y: 8 }, direction: true, type: ShipTypes.Small, length: 1 },
    { position: { x: 6, y: 4 }, direction: true, type: ShipTypes.Medium, length: 2 },
  ],
  [
    { position: { x: 1, y: 3 }, direction: false, type: ShipTypes.Huge, length: 4 },
    { position: { x: 3, y: 6 }, direction: true, type: ShipTypes.Large, length: 3 },
    { position: { x: 8, y: 4 }, direction: true, type: ShipTypes.Large, length: 3 },
    { position: { x: 7, y: 0 }, direction: true, type: ShipTypes.Medium, length: 2 },
    { position: { x: 3, y: 0 }, direction: true, type: ShipTypes.Medium, length: 2 },
    { position: { x: 0, y: 0 }, direction: true, type: ShipTypes.Medium, length: 2 },
    { position: { x: 7, y: 8 }, direction: true, type: ShipTypes.Small, length: 1 },
    { position: { x: 5, y: 0 }, direction: true, type: ShipTypes.Small, length: 1 },
    { position: { x: 9, y: 1 }, direction: false, type: ShipTypes.Small, length: 1 },
    { position: { x: 6, y: 3 }, direction: true, type: ShipTypes.Small, length: 1 },
  ],
];

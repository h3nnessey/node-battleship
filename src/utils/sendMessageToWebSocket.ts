import type { WebSocket } from 'ws';

export const sendMessageToWebSocket = (ws: WebSocket, type: string, data: unknown) => {
  ws.send(
    JSON.stringify({
      type,
      data: JSON.stringify(data),
      id: 0,
    }),
  );
};

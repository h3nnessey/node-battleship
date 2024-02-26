# Client + Server for the Battleship game using the WebSocket protocol

## Installation

1. Clone / download this repository
2. `npm run install:all` to install all dependencies for the client and server
3. You'll need two instances of the terminal, e.g. ![Splitted bash terminal](https://i.imgur.com/w1LbcLf.png)
4. Run `npm run start:client` in the first window to start the client HTTP server and `npm run start:ws:dev` / `npm run start:ws:prod` in the other window to start the websocket server.

## All scripts (run it from project rootdir only)

| Script                  | Description                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `npm run start:client`  | Start client HTTP server on `http://localhost:8181`                                         |
| `npm run start:ws:dev`  | Start WebSocket server on `http://localhost:3000` w ts-node-dev                             |
| `npm run start:ws:prod` | Built WebSocket server with Webpack and start it on `http://localhost:3000` w/o ts-node-dev |
| `npm run install:all`   | Install all dependencies for the client and server                                          |
| `npm run lint`          | Run ESlint for `src` folder                                                                 |
| `npm run prettier`      | Run Prettier for `src` folder                                                               |
| `npm run build`         | Build WebSocket server by Webpack                                                           |

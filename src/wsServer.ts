import WebSocket, { Server } from 'ws';
import { addLog } from './util/logger';

let clients: WebSocket[] = [];

const setupWebSocket = (wss: Server) => {
  wss.on('connection', (ws: WebSocket) => {
    clients.push(ws);
    addLog('📡 Frontend connected to WebSocket');

    ws.on('close', () => {
      clients = clients.filter((client) => client !== ws);
      addLog('❌ Frontend disconnected');
    });
  });
};

export const broadcastLog = (message: string) => {
  const logMessage = JSON.stringify({
    type: 'log',
    data: message,
    timestamp: new Date().toISOString()
  });
  
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(logMessage);
    }
  });
};

export const hasClients = (): boolean => clients.length > 0;

export default setupWebSocket;
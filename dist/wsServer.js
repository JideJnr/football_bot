"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasClients = exports.broadcastLog = void 0;
const ws_1 = __importDefault(require("ws"));
let clients = [];
const setupWebSocket = (wss) => {
    wss.on('connection', (ws) => {
        clients.push(ws);
        console.log('📡 Frontend connected to WebSocket');
        ws.on('close', () => {
            clients = clients.filter((client) => client !== ws);
            console.log('❌ Frontend disconnected');
        });
    });
};
const broadcastLog = (message) => {
    const logMessage = JSON.stringify({
        type: 'log',
        data: message,
        timestamp: new Date().toISOString()
    });
    clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(logMessage);
        }
    });
};
exports.broadcastLog = broadcastLog;
const hasClients = () => clients.length > 0;
exports.hasClients = hasClients;
exports.default = setupWebSocket;

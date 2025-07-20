"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const botController_1 = require("./botController");
const wsServer_1 = __importDefault(require("./wsServer"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
// Setup WebSocket
(0, wsServer_1.default)(wss);
// REST endpoints
app.post('/start', botController_1.startBot);
app.post('/stop', botController_1.stopBot);
app.post('/getStatus', botController_1.getStatus);
app.post('/betBuilder', botController_1.betBuilder);
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`✅ Bot Service running on port ${PORT}`);
});

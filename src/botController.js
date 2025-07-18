"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopBot = exports.startBot = void 0;
const wsServer_1 = require("./wsServer");
let botRunning = false;
const mockBotProcess = () => __awaiter(void 0, void 0, void 0, function* () {
    while (botRunning && (0, wsServer_1.hasClients)()) {
        (0, wsServer_1.broadcastLog)(`⚽ Bot is working... ${new Date().toISOString()}`);
        yield new Promise((res) => setTimeout(res, 1000));
    }
});
const startBot = (req, res) => {
    if (botRunning) {
        return res.status(400).json({ message: 'Bot already running' });
    }
    botRunning = true;
    mockBotProcess();
    res.json({ message: 'Bot started' });
};
exports.startBot = startBot;
const stopBot = (req, res) => {
    if (!botRunning) {
        return res.status(400).json({ message: 'Bot not running' });
    }
    botRunning = false;
    res.json({ message: 'Bot stopped' });
};
exports.stopBot = stopBot;

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
exports.getStatus = exports.stopBot = exports.startBot = void 0;
const index_1 = require("./master/index"); // 
// State
let masterBot = null;
let botRunning = false;
// Bot lifecycle
const startBot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (botRunning) {
        return res.status(200).json({
            success: false,
            status: 'BOT_ALREADY_RUNNING',
            message: 'Scraper is already running.'
        });
    }
    try {
        masterBot = new index_1.MasterBot();
        yield masterBot.start();
        botRunning = true;
        return res.status(200).json({
            success: true,
            status: 'BOT_STARTED',
            message: 'MasterBot started successfully.'
        });
    }
    catch (err) {
        botRunning = false;
        yield (masterBot === null || masterBot === void 0 ? void 0 : masterBot.stop());
        masterBot = null;
        const error = err instanceof Error ? err : new Error('Unknown startup failure');
        console.error('MASTERBOT_INIT_FAILURE:', error);
        return res.status(500).json({
            error: 'START_FAILURE',
            message: error.message
        });
    }
});
exports.startBot = startBot;
const stopBot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!botRunning) {
        return res.status(200).json({
            success: false,
            error: 'BOT_NOT_RUNNING',
            message: 'MasterBot is already stopped.'
        });
    }
    try {
        yield (masterBot === null || masterBot === void 0 ? void 0 : masterBot.stop());
        masterBot = null;
        botRunning = false;
        return res.status(200).json({
            success: true,
            status: 'BOT_STOPPED',
            message: 'MasterBot stopped successfully.'
        });
    }
    catch (err) {
        const error = err instanceof Error ? err : new Error('Shutdown failure');
        console.error('MASTERBOT_STOP_FAILURE:', error);
        return res.status(500).json({
            error: 'STOP_FAILURE',
            message: error.message
        });
    }
});
exports.stopBot = stopBot;
const getStatus = (_req, res) => {
    return res.status(200).json({
        success: true,
        message: botRunning ? 'Bot is running' : 'Bot is stopped',
        data: { running: botRunning }
    });
};
exports.getStatus = getStatus;

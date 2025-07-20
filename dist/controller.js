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
exports.getPredictionById = exports.postPrediction = exports.runBetBuilder = exports.getStatusById = exports.stopBotById = exports.startBotById = exports.getAllBot = exports.stopEngine = exports.startEngine = void 0;
let engineStatus = false;
let bots = [
    { id: '001', name: 'sportybet_football', status: false },
    { id: '002', name: 'sportybet_basketball', status: false },
];
const startEngine = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (engineStatus) {
        return res.status(200).json({
            success: false,
            status: 'ENGINE_ALREADY_RUNNING',
            message: 'Engine is already running.'
        });
    }
    return res.status(200).json({
        success: false,
        status: 'ENGINE_STARTED',
        message: 'Engine has started.'
    });
});
exports.startEngine = startEngine;
const stopEngine = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!engineStatus) {
        return res.status(200).json({
            success: false,
            error: 'BOT_NOT_RUNNING',
            message: 'Engine is not running.'
        });
    }
    // stop all bot actions then return message to frontend 
    return res.status(200).json({
        success: false,
        status: 'ENGINE_STOPPED',
        message: 'Engine has stopped.'
    });
});
exports.stopEngine = stopEngine;
const getAllBot = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!engineStatus) {
        return res.status(200).json({
            success: false,
            error: 'ENGINE_NOT_RUNNING',
            message: 'Engine is not running.'
        });
    }
    // RETURN LIST OF ALL BOT 
    return res.status(200).json({
        success: false,
        message: 'bot list fetched successfully.',
        data: bots
    });
});
exports.getAllBot = getAllBot;
const startBotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (engineStatus) {
        return res.status(200).json({
            success: false,
            status: 'BOT_ALREADY_RUNNING',
            message: 'Scraper is already running.'
        });
    }
    return res.status(200).json({
        success: true,
        status: 'BOT_LAUNCHED',
        message: 'Bot has started...'
    });
});
exports.startBotById = startBotById;
const stopBotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(200).json({
            success: false,
            error: 'BOT_NOT_RUNNING',
            message: 'Bot is already stopped.'
        });
    }
    return res.status(200).json({
        success: true,
        status: 'BOT_SHUTDOWN',
        message: 'Bot has stop running...'
    });
});
exports.stopBotById = stopBotById;
const getStatusById = (req, res) => {
    const { id } = req.body;
    return res.status(200).json({
        success: true,
        message: engineStatus ? 'Bot is active' : 'bot is not active',
        data: { running: engineStatus }
    });
};
exports.getStatusById = getStatusById;
const runBetBuilder = (req, res) => {
    const { type } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Bot not running or predictions unavailable.',
        });
    }
    return res.status(200).json({
        success: true,
        message: 'Bet slip generated.',
    });
};
exports.runBetBuilder = runBetBuilder;
const postPrediction = (req, res) => {
    const { data } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Bot not running or predictions unavailable.',
        });
    }
    return res.status(200).json({
        success: true,
        message: 'Bet slip generated.',
    });
};
exports.postPrediction = postPrediction;
const getPredictionById = (req, res) => {
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Bot not running or predictions unavailable.',
        });
    }
    return res.status(200).json({
        success: true,
        message: 'Bet slip generated.',
    });
};
exports.getPredictionById = getPredictionById;

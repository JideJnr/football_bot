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
exports.runBetBuilder = exports.getPredictionById = exports.postPrediction = exports.getStatusById = exports.getAllBots = exports.stopBotById = exports.startBotById = exports.stopEngine = exports.startEngine = void 0;
const index_1 = require("./bots/sporty/index");
// ================ Configuration ================
const BOT_CONTROLLERS = {
    sportybet_football: {
        start: index_1.startSportybetFootballBot,
        stop: index_1.stopSportybetFootballBot,
        status: index_1.getSportybetFootballStatus,
    }
};
const BOTS = [
    { id: 'sportybet_football', name: 'sportybet_football', status: false },
];
// ================ State Management ================
let engineStatus = false;
// ================ Helper Functions ================
const findBotById = (id) => BOTS.find(bot => bot.id === id);
const handleBotOperation = (bot, operation) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = BOT_CONTROLLERS[bot.name];
    if (!(controller === null || controller === void 0 ? void 0 : controller[operation]))
        return null;
    try {
        const result = yield controller[operation]();
        return result;
    }
    catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
});
const updateBotStatus = (bot, result, operation) => {
    var _a, _b;
    if (operation === 'start') {
        bot.status = (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : true;
    }
    else if (operation === 'stop') {
        bot.status = !((_b = result === null || result === void 0 ? void 0 : result.success) !== null && _b !== void 0 ? _b : true);
    }
};
// ================ Engine Operations ================
const startEngine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (engineStatus) {
        return res.status(200).json({
            success: false,
            status: 'ENGINE_ALREADY_RUNNING',
            message: 'Engine is already running.',
        });
    }
    const botResults = [];
    for (const bot of BOTS) {
        const result = yield handleBotOperation(bot, 'start');
        updateBotStatus(bot, result, 'start');
        botResults.push(Object.assign({ id: bot.id, name: bot.name }, result));
    }
    engineStatus = true;
    return res.status(200).json({
        success: true,
        status: 'ENGINE_STARTED',
        message: 'Engine has started and bots launched.',
        bots: botResults,
    });
});
exports.startEngine = startEngine;
const stopEngine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!engineStatus) {
        return res.status(200).json({
            success: false,
            status: 'ENGINE_NOT_RUNNING',
            message: 'Engine is not running.',
        });
    }
    const botResults = [];
    for (const bot of BOTS) {
        const result = yield handleBotOperation(bot, 'stop');
        updateBotStatus(bot, result, 'stop');
        botResults.push(Object.assign({ id: bot.id, name: bot.name }, result));
    }
    engineStatus = false;
    return res.status(200).json({
        success: true,
        status: 'ENGINE_STOPPED',
        message: 'Engine stopped and all bots shut down.',
        bots: botResults,
    });
});
exports.stopEngine = stopEngine;
// ================ Bot Operations ================
const startBotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            status: 'ENGINE_NOT_RUNNING',
            message: 'Engine must be running to start a bot.',
        });
    }
    const bot = findBotById(id);
    if (!bot)
        return res.status(404).json({ success: false, message: 'Bot not found.' });
    if (bot.status)
        return res.status(200).json({ success: false, message: 'Bot is already running.' });
    const result = yield handleBotOperation(bot, 'start');
    updateBotStatus(bot, result, 'start');
    return res.status(200).json({
        success: (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : true,
        message: (result === null || result === void 0 ? void 0 : result.message) || `Bot  started.`,
        data: bot,
    });
});
exports.startBotById = startBotById;
const stopBotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            status: 'ENGINE_NOT_RUNNING',
            message: 'Engine must be running to stop a bot.',
        });
    }
    const bot = findBotById(id);
    if (!bot)
        return res.status(404).json({ success: false, message: 'Bot not found.' });
    if (!bot.status)
        return res.status(200).json({ success: false, message: 'Bot already stopped.' });
    const result = yield handleBotOperation(bot, 'stop');
    updateBotStatus(bot, result, 'stop');
    return res.status(200).json({
        success: (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : true,
        message: (result === null || result === void 0 ? void 0 : result.message) || `Bot stopped.`,
        data: bot,
    });
});
exports.stopBotById = stopBotById;
// ================ Status Operations ================
const getAllBots = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            status: 'ENGINE_NOT_RUNNING',
            message: 'Engine must be running to view bots.',
        });
    }
    return res.status(200).json({
        success: true,
        message: 'Running bots fetched.',
        data: BOTS,
    });
});
exports.getAllBots = getAllBots;
const getStatusById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.body;
    const bot = findBotById(id);
    if (!bot)
        return res.status(404).json({ success: false, message: 'Bot not found.' });
    const result = yield handleBotOperation(bot, 'status');
    const isRunning = (_a = result === null || result === void 0 ? void 0 : result.success) !== null && _a !== void 0 ? _a : bot.status;
    return res.status(200).json({
        success: true,
        message: `Bot ${bot.name} is ${isRunning ? 'running' : 'not running'}.`,
        data: Object.assign(Object.assign({}, bot), { status: isRunning }),
    });
});
exports.getStatusById = getStatusById;
// ================ Prediction Operations ================
const postPrediction = (req, res) => {
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Engine is not running.',
        });
    }
    const { data } = req.body;
    console.log('Prediction received:', data);
    return res.status(200).json({
        success: true,
        message: 'Prediction received.',
    });
};
exports.postPrediction = postPrediction;
const getPredictionById = (req, res) => {
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Engine is not running.',
        });
    }
    const { id } = req.body;
    console.log(`Fetching prediction for bot: ${id}`);
    return res.status(200).json({
        success: true,
        message: 'Prediction fetched.',
        data: { id },
    });
};
exports.getPredictionById = getPredictionById;
const runBetBuilder = (req, res) => {
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Engine is not running.',
        });
    }
    const { type } = req.body;
    console.log(`Bet builder type: ${type}`);
    return res.status(200).json({
        success: true,
        message: 'Bet slip generated.',
    });
};
exports.runBetBuilder = runBetBuilder;

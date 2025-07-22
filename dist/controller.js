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
exports.getPredictionById = exports.postPrediction = exports.runBetBuilder = exports.getStatusById = exports.getAllBot = exports.stopBotById = exports.startBotById = exports.stopEngine = exports.startEngine = void 0;
const index_1 = require("./bots/sporty/index");
const test_1 = require("./bots/test");
const botControllerMap = {
    sportybet_football: {
        start: index_1.startSportybetFootballBot,
        stop: index_1.stopSportybetFootballBot,
        status: index_1.getSportybetFootballStatus,
    },
    test_bot: {
        start: test_1.startTestBot,
        stop: test_1.stopTestBot,
        status: test_1.getTestStatus,
    },
};
const bots = [
    { id: 'sportybet_football', name: 'sportybet_football', status: false },
    { id: 'bot_test', name: 'bot_test', status: false },
];
let engineStatus = false;
const findBotById = (id) => bots.find(bot => bot.id === id);
const startEngine = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (engineStatus) {
        return res.status(200).json({
            success: false,
            status: 'ENGINE_ALREADY_RUNNING',
            message: 'Engine is already running.',
        });
    }
    engineStatus = true;
    for (const bot of bots) {
        const controller = botControllerMap[bot.name];
        if (controller === null || controller === void 0 ? void 0 : controller.start) {
            yield controller.start();
            bot.status = true;
        }
    }
    return res.status(200).json({
        success: true,
        status: 'ENGINE_STARTED',
        message: 'Engine has started and all bots are running.',
        bots,
    });
});
exports.startEngine = startEngine;
const stopEngine = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!engineStatus) {
        return res.status(200).json({
            success: false,
            error: 'ENGINE_NOT_RUNNING',
            message: 'Engine is not running.',
        });
    }
    for (const bot of bots) {
        const controller = botControllerMap[bot.name];
        if (controller === null || controller === void 0 ? void 0 : controller.stop) {
            yield controller.stop();
            bot.status = false;
        }
    }
    engineStatus = false;
    return res.status(200).json({
        success: true,
        status: 'ENGINE_STOPPED',
        message: 'Engine has stopped and all bots are shut down.',
        bots,
    });
});
exports.stopEngine = stopEngine;
const startBotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            status: 'ENGINE_NOT_RUNNING',
            message: 'Engine must be running to start a bot.',
        });
    }
    const bot = findBotById(id);
    if (!bot) {
        return res.status(404).json({ success: false, message: 'Bot not found.' });
    }
    if (bot.status) {
        return res.status(200).json({ success: false, message: 'Bot is already running.' });
    }
    const controller = botControllerMap[bot.name];
    if (controller === null || controller === void 0 ? void 0 : controller.start) {
        yield controller.start();
        bot.status = true;
    }
    return res.status(200).json({
        success: true,
        message: `Bot ${bot.name} has been started.`,
        data: bot,
    });
});
exports.startBotById = startBotById;
const stopBotById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            error: 'ENGINE_NOT_RUNNING',
            message: 'Engine must be running to stop a bot.',
        });
    }
    const bot = findBotById(id);
    if (!bot) {
        return res.status(404).json({ success: false, message: 'Bot not found.' });
    }
    if (!bot.status) {
        return res.status(200).json({ success: false, message: 'Bot is already stopped.' });
    }
    const controller = botControllerMap[bot.name];
    if (controller === null || controller === void 0 ? void 0 : controller.stop) {
        yield controller.stop();
        bot.status = false;
    }
    return res.status(200).json({
        success: true,
        message: `Bot ${bot.name} has been stopped.`,
        data: bot,
    });
});
exports.stopBotById = stopBotById;
const getAllBot = (res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            status: 'ENGINE_NOT_RUNNING',
            message: 'Engine must be running to start a bot.',
        });
    }
    return res.status(200).json({
        success: true,
        message: `Bot list fetched has been started.`,
        data: bots,
    });
});
exports.getAllBot = getAllBot;
const getStatusById = (req, res) => {
    const { id } = req.body;
    const bot = findBotById(id);
    if (!bot) {
        return res.status(404).json({ success: false, message: 'Bot not found.' });
    }
    const controller = botControllerMap[bot.name];
    if (controller === null || controller === void 0 ? void 0 : controller.status) {
        bot.status = controller.status();
    }
    return res.status(200).json({
        success: true,
        message: `Bot ${bot.name} is ${bot.status ? 'running' : 'not running'}.`,
        data: bot,
    });
};
exports.getStatusById = getStatusById;
const runBetBuilder = (req, res) => {
    const { type } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Engine is not running.',
        });
    }
    // TODO: Implement bet builder logic
    console.log(`Bet builder type: ${type}`);
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
            message: 'Engine is not running.',
        });
    }
    // TODO: Implement prediction logic
    console.log('Received prediction:', data);
    return res.status(200).json({
        success: true,
        message: 'Prediction received.',
    });
};
exports.postPrediction = postPrediction;
const getPredictionById = (req, res) => {
    const { id } = req.body;
    if (!engineStatus) {
        return res.status(400).json({
            success: false,
            message: 'Engine is not running.',
        });
    }
    // TODO: Fetch prediction by ID
    console.log(`Fetching prediction for bot: ${id}`);
    return res.status(200).json({
        success: true,
        message: 'Prediction fetched.',
        data: { id }, // Replace with real prediction data
    });
};
exports.getPredictionById = getPredictionById;

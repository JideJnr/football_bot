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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestStatus = exports.stopTestBot = exports.startTestBot = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const sportytoday_1 = require("./sportytoday");
let cronJobs = {};
let isRunning = false;
const startTestBot = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isRunning)
        return;
    cronJobs['today'] = node_cron_1.default.schedule('0 0 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[CRON] SportyBet Football: Today match job triggered');
        yield (0, sportytoday_1.today)();
    }));
    isRunning = true;
    console.log('[SPORTYBET_FOOTBALL] Bot started');
});
exports.startTestBot = startTestBot;
const stopTestBot = () => {
    if (!isRunning)
        return;
    Object.values(cronJobs).forEach(job => job.stop());
    cronJobs = {};
    isRunning = false;
    console.log('[SPORTYBET_FOOTBALL] Bot stopped');
};
exports.stopTestBot = stopTestBot;
const getTestStatus = () => isRunning;
exports.getTestStatus = getTestStatus;

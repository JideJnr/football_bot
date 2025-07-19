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
exports.MatchScraper = void 0;
// src/runners/MatchScraper.ts
const sportybet_1 = require("./sportybet");
const wsServer_1 = require("../wsServer");
const BasicMatchCleaner_1 = require("../cleaners/BasicMatchCleaner");
class MatchScraper {
    constructor(onDataCleaned) {
        this.todayMatches = [];
        this.liveMatches = [];
        this.cleaner = new BasicMatchCleaner_1.BasicMatchCleaner();
        this.onDataCleaned = onDataCleaned;
        this.startScrapers();
        (0, wsServer_1.broadcastLog)('🔧 MatchScraper initialized with built-in cleaner');
    }
    startScrapers() {
        (0, wsServer_1.broadcastLog)('🚀 Starting scrapers...');
        this.scheduleDailyScrape();
        this.scheduleLiveScrape();
    }
    processMatches(rawData, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cleanedData = yield this.cleaner.cleanAndSave(rawData);
                (0, wsServer_1.broadcastLog)(`🧼 Cleaned ${type} matches (${cleanedData.length} items)`);
                // Store cleaned data internally
                if (type === 'today')
                    this.todayMatches = cleanedData;
                if (type === 'live')
                    this.liveMatches = cleanedData;
                // Notify MasterBot if callback exists
                if (this.onDataCleaned) {
                    this.onDataCleaned(cleanedData, type);
                }
                return cleanedData;
            }
            catch (err) {
                (0, wsServer_1.broadcastLog)(`⚠️ Cleaning error: ${err instanceof Error ? err.message : 'Unknown error'}`);
                throw err;
            }
        });
    }
    scheduleDailyScrape() {
        const task = () => __awaiter(this, void 0, void 0, function* () {
            try {
                (0, wsServer_1.broadcastLog)('⏳ Fetching today matches...');
                const rawData = yield (0, sportybet_1.fetchTodayMatches)();
                yield this.processMatches(rawData, 'today');
                (0, wsServer_1.broadcastLog)(`✅ Today matches processed: ${this.todayMatches.length} events`);
            }
            catch (err) {
                this.todayMatches = [];
                (0, wsServer_1.broadcastLog)(`⚠️ Today matches error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        });
        // Immediate first run
        task();
        // Schedule recurring midnight runs
        const scheduleNext = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const delay = midnight.getTime() - now.getTime();
            this.dailyTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield task();
                scheduleNext();
            }), delay);
        };
        scheduleNext();
        (0, wsServer_1.broadcastLog)('📅 Today matches scraper scheduled for daily midnight runs');
    }
    scheduleLiveScrape() {
        const task = () => __awaiter(this, void 0, void 0, function* () {
            try {
                (0, wsServer_1.broadcastLog)('🔴 Fetching live matches...');
                const rawData = yield (0, sportybet_1.fetchLiveMatches)();
                yield this.processMatches(rawData, 'live');
                (0, wsServer_1.broadcastLog)(`⚡ Live matches processed: ${this.liveMatches.length} events`);
            }
            catch (err) {
                this.liveMatches = [];
                (0, wsServer_1.broadcastLog)(`⚠️ Live matches error: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        });
        // Immediate first run
        task();
        // Schedule recurring every 5 minutes
        this.liveInterval = setInterval(task, 5 * 60 * 1000);
        (0, wsServer_1.broadcastLog)('🔁 Live matches scraper running every 5 minutes');
    }
    // Data access methods
    getTodayMatches() {
        return this.todayMatches;
    }
    getLiveMatches() {
        return this.liveMatches;
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.dailyTimeout) {
                clearTimeout(this.dailyTimeout);
                (0, wsServer_1.broadcastLog)('🛑 Stopped daily scraper');
            }
            if (this.liveInterval) {
                clearInterval(this.liveInterval);
                (0, wsServer_1.broadcastLog)('🛑 Stopped live scraper');
            }
        });
    }
}
exports.MatchScraper = MatchScraper;

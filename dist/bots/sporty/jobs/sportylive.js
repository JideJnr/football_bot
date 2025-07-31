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
exports.live = live;
const sportybet_1 = require("../../../runners/sportybet");
const Cleaner_1 = require("../cleaners/Cleaner");
const MatchDatabaseService_1 = require("../database/MatchDatabaseService");
function live() {
    return __awaiter(this, void 0, void 0, function* () {
        const dbService = new MatchDatabaseService_1.LiveMatchDatabaseService(process.env.MONGO_URI);
        try {
            yield dbService.connect();
            // 1. Scrape
            const rawMatches = yield (0, sportybet_1.fetchLiveMatches)();
            // 2. Clean
            const cleaner = new Cleaner_1.ComprehensiveMatchCleaner();
            const cleanedMatches = yield cleaner.cleanAndSave(rawMatches);
            // 3. Save to DB
            yield dbService.saveMatches(cleanedMatches);
            console.log('Pipeline complete.');
        }
        catch (error) {
            console.error('Live pipeline failed:', error);
        }
        finally {
            yield dbService.close();
        }
    });
}

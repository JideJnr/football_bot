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
exports.today = today;
const save_1 = require("../../db/save");
const MatchCleaner_1 = require("../../cleaners/MatchCleaner");
const sportybet_1 = require("../../runners/sportybet");
function today() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Fetch summary data
            const rawSummaries = yield (0, sportybet_1.fetchTodayMatches)();
            console.log(`Fetched ${rawSummaries.length} match summaries`);
            if (rawSummaries.length === 0) {
                console.log('No matches found for today');
                return;
            }
            const rawMatches = [];
            for (const summary of rawSummaries) {
                try {
                    const detailed = yield (0, sportybet_1.fetchMatchDetails)(summary.eventId);
                    rawMatches.push(detailed);
                    console.log(`Fetched details for ${summary.eventId}`);
                    // Add delay to avoid rate limiting (200ms between requests)
                    yield new Promise(resolve => setTimeout(resolve, 200));
                }
                catch (error) {
                    console.error(`Skipping ${summary.eventId} due to error`);
                }
            }
            // 3. Clean detailed data
            const cleaner = new MatchCleaner_1.DetailedMatchCleaner();
            const cleanedMatches = rawMatches.map(match => cleaner.clean(match));
            // 4. Save to database
            yield (0, save_1.saveToDB)(cleanedMatches);
            console.log(`Saved ${cleanedMatches.length} detailed matches`);
        }
        catch (error) {
            console.error('Pipeline failed:', error);
        }
    });
}

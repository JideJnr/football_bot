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
exports.BasicMatchCleaner = void 0;
const wsServer_1 = require("../wsServer");
class BasicMatchCleaner {
    constructor() {
        (0, wsServer_1.broadcastLog)('🧹 ComprehensiveMatchCleaner initialized');
    }
    cleanAndSave(rawMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            const cleanedMatches = rawMatches.map((match) => this.clean(match));
            (0, wsServer_1.broadcastLog)(`✅ ComprehensiveMatchCleaner cleaned ${cleanedMatches.length} matches`);
            return cleanedMatches;
        });
    }
    clean(raw) {
        const cleaned = {
            id: raw.eventId,
            home: raw.homeTeamName,
            away: raw.awayTeamName,
            tournament: raw.sport.category.tournament.name,
            status: raw.status,
            score: raw.setScore,
            period: raw.period,
            playedSeconds: raw.playedSeconds,
            startTime: raw.estimateStartTime,
            markets: {},
        };
        // Process all markets
        raw.markets.forEach(market => {
            const marketType = market.desc;
            const specifier = market.specifier || "main";
            if (!cleaned.markets[marketType]) {
                cleaned.markets[marketType] = {};
            }
            const outcomes = {};
            market.outcomes.forEach(outcome => {
                if (outcome.isActive === 1) {
                    outcomes[outcome.desc] = parseFloat(outcome.odds);
                }
            });
            cleaned.markets[marketType][specifier] = {
                outcomes,
                lastUpdated: market.lastOddsChangeTime,
                status: market.status
            };
        });
        (0, wsServer_1.broadcastLog)(`✅ Cleaned match: ${cleaned.home} vs ${cleaned.away}`);
        return cleaned;
    }
}
exports.BasicMatchCleaner = BasicMatchCleaner;

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
const wsServer_1 = require("../../../../wsServer");
class BasicMatchCleaner {
    constructor() {
        (0, wsServer_1.broadcastLog)('🧹 BasicMatchCleaner initialized');
    }
    cleanAndSave(rawMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            const cleanedMatches = rawMatches.map((match) => this.clean(match));
            (0, wsServer_1.broadcastLog)(`✅ BasicMatchCleaner cleaned ${cleanedMatches.length} matches`);
            return cleanedMatches;
        });
    }
    /**
     * Clean a single RawMatch into a CleanedMatch
     */
    clean(raw) {
        const cleanMatch = {
            id: raw.id,
            home: raw.homeTeam,
            away: raw.awayTeam,
            odds: [raw.odds.home, raw.odds.draw, raw.odds.away],
        };
        (0, wsServer_1.broadcastLog)(`✅ Cleaned match: ${cleanMatch.home} vs ${cleanMatch.away}`);
        return cleanMatch;
    }
}
exports.BasicMatchCleaner = BasicMatchCleaner;

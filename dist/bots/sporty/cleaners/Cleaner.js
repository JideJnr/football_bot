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
exports.ComprehensiveMatchCleaner = void 0;
const wsServer_1 = require("../../../wsServer");
class ComprehensiveMatchCleaner {
    constructor() {
        (0, wsServer_1.broadcastLog)('🧹 ComprehensiveMatchCleaner initialized');
    }
    cleanAndSave(rawMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            const cleanedMatches = rawMatches.map(match => this.clean(match));
            (0, wsServer_1.broadcastLog)(`✅ Cleaned ${cleanedMatches.length} matches`);
            return cleanedMatches;
        });
    }
    clean(raw) {
        // Preserve all top-level match data
        const cleaned = Object.assign(Object.assign({}, raw), { markets: {} });
        // Process markets
        raw.markets.forEach(market => {
            const marketType = market.desc;
            const specifier = market.specifier || 'main';
            if (!cleaned.markets[marketType]) {
                cleaned.markets[marketType] = {};
            }
            // Create outcomes map for active outcomes
            const outcomesMap = {};
            market.outcomes.forEach(outcome => {
                if (outcome.isActive === 1) {
                    outcomesMap[outcome.desc] = outcome;
                }
            });
            // Preserve all market data + add outcomes map
            cleaned.markets[marketType][specifier] = Object.assign(Object.assign({}, market), { outcomesMap });
        });
        (0, wsServer_1.broadcastLog)(`✅ Cleaned match: ${raw.homeTeamName} vs ${raw.awayTeamName}`);
        return cleaned;
    }
}
exports.ComprehensiveMatchCleaner = ComprehensiveMatchCleaner;

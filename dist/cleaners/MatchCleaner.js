"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchCleaner = void 0;
const wsServer_1 = require("../wsServer");
class MatchCleaner {
    constructor() {
        (0, wsServer_1.broadcastLog)('🧹 ComprehensiveMatchCleaner initialized');
    }
    /**
     * Cleans summary match data from the listing endpoint
     * @param raw - Raw match summary data
     * @returns Cleaned match object
     */
    cleanSummary(raw) {
        return {
            id: raw.eventId,
            home: raw.homeTeamName,
            away: raw.awayTeamName,
            tournament: raw.sport.category.tournament.name,
            status: raw.status,
            score: raw.setScore,
            period: raw.period,
            playedSeconds: raw.playedSeconds,
            startTime: raw.estimateStartTime,
            markets: this.processMarkets(raw.markets),
            isDetailed: false
        };
    }
    /**
     * Cleans detailed match data from the event endpoint
     * @param raw - Raw detailed match data
     * @returns Cleaned match object
     */
    cleanDetailed(raw) {
        var _a;
        return {
            id: raw.eventId,
            home: raw.homeTeamName,
            away: raw.awayTeamName,
            tournament: raw.sport.category.tournament.name,
            status: raw.status,
            score: raw.setScore,
            period: raw.period,
            playedSeconds: raw.playedSeconds,
            startTime: raw.estimateStartTime,
            markets: this.processMarkets(raw.markets),
            isDetailed: true,
            additionalData: {
                gameId: raw.gameId,
                matchStatus: raw.matchStatus,
                remainingTime: raw.remainingTimeInPeriod,
                venue: ((_a = raw.fixtureVenue) === null || _a === void 0 ? void 0 : _a.name) || ''
            }
        };
    }
    /**
     * Processes markets array into structured format
     * @param markets - Array of market objects
     * @returns Structured markets object
     */
    processMarkets(markets) {
        const processed = {};
        markets.forEach(market => {
            const marketType = market.desc;
            const specifier = market.specifier || "main";
            if (!processed[marketType]) {
                processed[marketType] = {};
            }
            const outcomes = {};
            market.outcomes.forEach((outcome) => {
                if (outcome.isActive === 1) {
                    outcomes[outcome.desc] = parseFloat(outcome.odds);
                }
            });
            processed[marketType][specifier] = {
                outcomes,
                lastUpdated: market.lastOddsChangeTime,
                status: market.status
            };
        });
        return processed;
    }
}
exports.MatchCleaner = MatchCleaner;

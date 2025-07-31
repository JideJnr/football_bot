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
exports.LiveMatchDatabaseService = void 0;
const mongodb_1 = require("mongodb");
class LiveMatchDatabaseService {
    constructor(connectionString) {
        this.dbName = 'sportybet';
        this.collectionName = 'matches';
        this.client = new mongodb_1.MongoClient(connectionString);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
        });
    }
    saveMatches(cleanedMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.client.db(this.dbName);
            const collection = db.collection(this.collectionName);
            const bulkOps = cleanedMatches.map(match => {
                var _a, _b, _c;
                // Extract static data
                const staticData = {
                    homeTeamId: match.homeTeamId,
                    homeTeamName: match.homeTeamName,
                    awayTeamId: match.awayTeamId,
                    awayTeamName: match.awayTeamName,
                    tournament: {
                        sportId: match.sport.id,
                        sportName: match.sport.name,
                        categoryId: match.sport.category.id,
                        categoryName: match.sport.category.name,
                        tournamentId: (_a = match.sport.category.tournament) === null || _a === void 0 ? void 0 : _a.id,
                        tournamentName: (_b = match.sport.category.tournament) === null || _b === void 0 ? void 0 : _b.name
                    },
                    venue: (_c = match.fixtureVenue) === null || _c === void 0 ? void 0 : _c.name,
                    initialEstimateStartTime: new Date(match.estimateStartTime)
                };
                // Prepare current odds snapshot
                const currentOddsSnapshot = {
                    timestamp: new Date(),
                    markets: Object.entries(match.markets).map(([marketType, marketData]) => ({
                        marketType,
                        outcomes: Object.values(marketData).flatMap(market => market.outcomes.map(outcome => ({
                            desc: outcome.desc,
                            odds: parseFloat(outcome.odds),
                            probability: parseFloat(outcome.probability),
                            isActive: outcome.isActive === 1
                        })))
                    })),
                    scoreAtTime: match.setScore,
                    matchStatusAtTime: match.matchStatus
                };
                return {
                    updateOne: {
                        filter: { eventId: match.eventId },
                        update: {
                            $setOnInsert: {
                                staticData,
                                createdAt: new Date()
                            },
                            $set: {
                                'dynamicData.currentStatus': match.status,
                                'dynamicData.currentScore': match.setScore,
                                'dynamicData.period': match.period,
                                'dynamicData.playedSeconds': match.playedSeconds,
                                'dynamicData.lastUpdated': new Date(),
                                updatedAt: new Date()
                            },
                            $push: {
                                oddsHistory: {
                                    $each: [currentOddsSnapshot],
                                    $slice: -1000 // Keep last 1000 snapshots (adjust as needed)
                                }
                            }
                        },
                        upsert: true
                    }
                };
            });
            yield collection.bulkWrite(bulkOps);
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
        });
    }
}
exports.LiveMatchDatabaseService = LiveMatchDatabaseService;

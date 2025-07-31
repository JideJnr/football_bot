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
    constructor(mongoUri) {
        this.mongoUri = mongoUri;
        this.db = null;
        this.collection = null;
        this.client = new mongodb_1.MongoClient(this.mongoUri);
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.connect();
                this.db = this.client.db('sportsData');
                this.collection = this.db.collection('liveMatches');
                yield this.createIndexes();
                console.log('✅ MongoDB connected successfully');
            }
            catch (error) {
                console.error('❌ MongoDB connection failed:', error);
                throw error;
            }
        });
    }
    createIndexes() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.collection)
                return;
            try {
                yield this.collection.createIndexes([
                    { key: { eventId: 1 }, unique: true },
                    { key: { 'sport.id': 1 } },
                    { key: { 'sport.category.id': 1 } },
                    { key: { 'sport.category.tournament.id': 1 } },
                    { key: { homeTeamId: 1 } },
                    { key: { awayTeamId: 1 } },
                    { key: { estimateStartTime: 1 } },
                    { key: { status: 1 } },
                    { key: { 'markets': 1 } },
                    { key: { 'bookingStatus': 1 } }
                ]);
                console.log('✅ Database indexes created');
            }
            catch (error) {
                console.error('❌ Failed to create indexes:', error);
            }
        });
    }
    saveMatches(matches) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.collection) {
                throw new Error('Database not connected');
            }
            try {
                const bulkOps = matches.map(match => ({
                    updateOne: {
                        filter: { eventId: match.eventId },
                        update: { $set: match },
                        upsert: true
                    }
                }));
                if (bulkOps.length === 0) {
                    console.log('⚠️ No matches to save');
                    return 0;
                }
                const result = yield this.collection.bulkWrite(bulkOps);
                console.log(`✅ Saved ${result.upsertedCount + result.modifiedCount} matches`);
                return result.upsertedCount + result.modifiedCount;
            }
            catch (error) {
                console.error('❌ Failed to save matches:', error);
                throw error;
            }
        });
    }
    getMatchById(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.collection)
                throw new Error('Database not connected');
            return this.collection.findOne({ eventId });
        });
    }
    getActiveMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.collection)
                throw new Error('Database not connected');
            return this.collection.find({ status: { $in: [1, 2] } }).toArray();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.close();
                this.db = null;
                this.collection = null;
                console.log('✅ MongoDB connection closed');
            }
            catch (error) {
                console.error('❌ Failed to close connection:', error);
                throw error;
            }
        });
    }
}
exports.LiveMatchDatabaseService = LiveMatchDatabaseService;

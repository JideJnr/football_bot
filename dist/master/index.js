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
exports.MasterBot = void 0;
const wsServer_1 = require("../wsServer");
const index_1 = require("../runners/index");
class MasterBot {
    constructor() {
        this.isRunning = false;
        (0, wsServer_1.broadcastLog)('⚙️ MasterBot initialized (Data Receiver Mode)');
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRunning)
                throw new Error('Already running');
            this.scraper = new index_1.MatchScraper((cleanedData, type) => {
                this.handleCleanedData(cleanedData, type);
            });
            this.isRunning = true;
            (0, wsServer_1.broadcastLog)('🟢 MasterBot started (Receiving cleaned data)');
        });
    }
    /** Analyze a batch of cleaned matches and assign a strength rating. */
    analyze(cleanedMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, wsServer_1.broadcastLog)(`🔍 MasterBot analyzing ${cleanedMatches.length} matches`);
            return cleanedMatches.map(match => ({
                home: match.home,
                away: match.away,
                strengthRating: 0,
                id: 'A',
                odds: 3.45
            }));
        });
    }
    handleCleanedData(cleanedData, type) {
        (0, wsServer_1.broadcastLog)(`📥 Received ${type} data (${cleanedData.length} items)`);
        // Additional processing can be added here.
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield ((_a = this.scraper) === null || _a === void 0 ? void 0 : _a.cleanup());
            this.isRunning = false;
            (0, wsServer_1.broadcastLog)('🔴 MasterBot stopped');
        });
    }
}
exports.MasterBot = MasterBot;

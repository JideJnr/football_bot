"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetBuilder = void 0;
class BetBuilder {
    constructor(builderType, numGames, predictions, verdicts) {
        this.builderType = builderType;
        this.numGames = numGames;
        this.predictions = predictions;
        this.verdicts = verdicts;
    }
    build() {
        let filtered = [];
        switch (this.builderType) {
            case 'sniper':
                filtered = this.sniperStrategy();
                break;
            case 'sure':
                filtered = this.sureStrategy();
                break;
            case 'opportunist':
                filtered = this.opportunistStrategy();
                break;
            default:
                filtered = [];
        }
        const selected = filtered.slice(0, this.numGames);
        return {
            matches: selected,
            context: {
                builderType: this.builderType,
                selectedCount: selected.length,
                totalAvailable: filtered.length,
                strategyDetails: `Strategy: ${this.builderType}, Requested: ${this.numGames}`,
            },
        };
    }
    sniperStrategy() {
        return this.predictions.filter(pred => {
            const verdict = this.verdicts.find(v => v.matchId === pred.matchId);
            return (verdict === null || verdict === void 0 ? void 0 : verdict.decision) === 0.80;
        });
    }
    sureStrategy() {
        return this.predictions.filter(pred => {
            const verdict = this.verdicts.find(v => v.matchId === pred.matchId);
            return (verdict === null || verdict === void 0 ? void 0 : verdict.decision) === 0.80;
        });
    }
    opportunistStrategy() {
        return this.predictions.filter(pred => {
            const verdict = this.verdicts.find(v => v.matchId === pred.matchId);
            return (verdict === null || verdict === void 0 ? void 0 : verdict.decision) === 0.79;
        });
    }
}
exports.BetBuilder = BetBuilder;

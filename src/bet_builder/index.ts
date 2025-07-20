import { Prediction, Verdict } from '../type/types';

type BuilderType = 'sniper' | 'sure' | 'opportunist';

interface BetSlip {
    matches: Prediction[];
    context: {
        builderType: BuilderType;
        selectedCount: number;
        totalAvailable: number;
        strategyDetails: string;
    };
}

export class BetBuilder {
    constructor(
        private builderType: BuilderType,
        private numGames: number,
        private predictions: Prediction[],
        private verdicts: Verdict[]
    ) {}

    build(): BetSlip {
        let filtered: Prediction[] = [];

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

    private sniperStrategy(): Prediction[] {
        return this.predictions.filter(pred => {
            const verdict = this.verdicts.find(v => v.matchId === pred.matchId);
            return verdict?.decision === 'safe';
        });
    }

    private sureStrategy(): Prediction[] {
        return this.predictions.filter(pred => {
            const verdict = this.verdicts.find(v => v.matchId === pred.matchId);
            return verdict?.decision === 'safe';
        });
    }

    private opportunistStrategy(): Prediction[] {
        return this.predictions.filter(pred => {
            const verdict = this.verdicts.find(v => v.matchId === pred.matchId);
            return verdict?.decision === 'risky';
        });
    }
}
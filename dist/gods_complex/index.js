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
exports.GodComplex = void 0;
const statistical_1 = require("./engines/statistical");
const pattern_1 = require("./engines/pattern");
const probability_1 = require("./engines/probability");
const momentum_1 = require("./engines/momentum");
const market_1 = require("./engines/market");
const watchdog_1 = require("./engines/watchdog");
const similarity_1 = require("./engines/similarity");
const learning_1 = require("./engines/learning");
const judge_1 = require("./engines/judge");
const human_1 = require("./engines/human");
class GodComplex {
    constructor() {
        this.statistical = new statistical_1.StatisticalEngine();
        this.pattern = new pattern_1.PatternEngine();
        this.probability = new probability_1.ProbabilityEngine();
        this.momentum = new momentum_1.MomentumEngine();
        this.market = new market_1.MarketEngine();
        this.watchdog = new watchdog_1.WatchdogEngine();
        this.similarity = new similarity_1.SimilarityEngine();
        this.learning = new learning_1.LearningEngine();
        this.human = new human_1.HumanEngine();
        this.judge = new judge_1.JudgeEngine();
    }
    process(matches, dataType) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const match of matches) {
                const verdicts = yield Promise.all([
                    this.statistical.analyze(match, dataType),
                    this.pattern.analyze(match, dataType),
                    this.probability.analyze(match, dataType),
                    this.momentum.analyze(match, dataType),
                    this.market.analyze(match, dataType),
                    this.watchdog.analyze(match, dataType),
                    this.similarity.analyze(match, dataType),
                    this.learning.analyze(match, dataType)
                ]);
                const humanVerdict = yield this.human.analyze(match, dataType);
                if (humanVerdict)
                    verdicts.push(humanVerdict);
                const finalVerdict = yield this.judge.deliverVerdict(verdicts);
                console.log(finalVerdict);
            }
            return results;
        });
    }
    /**
     * Run prediction on analyzed matches.
     * Converts each AnalyzedMatch to a Prediction.
     */
    run(analyzedMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            return analyzedMatches.map(am => ({
                matchId: am.matchId,
                predictedOutcome: am.predictedOutcome,
                confidence: am.confidence,
                engine: am.engine,
                reasoning: am.reasoning,
                timestamp: new Date().toISOString(), // Generate current timestamp
            }));
        });
    }
}
exports.GodComplex = GodComplex;

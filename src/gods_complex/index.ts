import { MatchData, PredictionResult, AnalyzedMatch, Prediction } from '../type/types';
import { StatisticalEngine } from './engines/statistical';
import { PatternEngine } from './engines/pattern';
import { ProbabilityEngine } from './engines/probability';
import { MomentumEngine } from './engines/momentum';
import { MarketEngine } from './engines/market';
import { WatchdogEngine } from './engines/watchdog';
import { SimilarityEngine } from './engines/similarity';
import { LearningEngine } from './engines/learning';
import { JudgeEngine } from './engines/judge';
import { HumanEngine } from './engines/human';

export class GodComplex {
  private statistical = new StatisticalEngine();
  private pattern = new PatternEngine();
  private probability = new ProbabilityEngine();
  private momentum = new MomentumEngine();
  private market = new MarketEngine();
  private watchdog = new WatchdogEngine();
  private similarity = new SimilarityEngine();
  private learning = new LearningEngine();
  private human = new HumanEngine();
  private judge = new JudgeEngine();

  public async process(
    matches: MatchData[],
    dataType: 'today' | 'live'
  ): Promise<PredictionResult[]> {
    const results: PredictionResult[] = [];
    for (const match of matches) {
      const verdicts = await Promise.all([
        this.statistical.analyze(match, dataType),
        this.pattern.analyze(match, dataType),
        this.probability.analyze(match, dataType),
        this.momentum.analyze(match, dataType),
        this.market.analyze(match, dataType),
        this.watchdog.analyze(match, dataType),
        this.similarity.analyze(match, dataType),
        this.learning.analyze(match, dataType)
      ]);
      const humanVerdict = await this.human.analyze(match, dataType);
      if (humanVerdict) verdicts.push(humanVerdict);
      const finalVerdict = await this.judge.deliverVerdict(verdicts);
      console.log(finalVerdict);
    }
    return results;
  }

  /** 
   * Run prediction on analyzed matches.
   * Converts each AnalyzedMatch to a Prediction.
   */
public async run(analyzedMatches: AnalyzedMatch[]): Promise<Prediction[]> {
  return analyzedMatches.map(am => ({
    matchId: am.matchId,
    predictedOutcome: am.predictedOutcome,
    confidence: am.confidence,
    engine: am.engine,
    reasoning: am.reasoning,
    timestamp: new Date().toISOString(), // Generate current timestamp
  }));
}
}

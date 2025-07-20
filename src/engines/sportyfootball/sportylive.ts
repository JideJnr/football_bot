import { fetchLiveMatches } from '../../runners/sportybet';
import { BasicMatchCleaner } from '../../cleaners/BasicMatchCleaner';
import { SignalBot } from '../../signal';
import { GodComplex } from '../../gods_complex';
import { JudgeEngine } from '../../gods_complex/engines/judge';
import { ResponseLogger } from '../../gods_complex/responses';
import { saveToDB } from '../../db/save';

import { RawMatch, CleanedMatch, AnalyzedMatch, Prediction, Verdict } from '../../type/types';

async function live() {
  // 1. Scrape
  const rawMatches: RawMatch[] = await fetchLiveMatches();

  // 2. Clean
  const cleaner = new BasicMatchCleaner();
  const cleanedMatches: CleanedMatch[] = rawMatches.map((match: RawMatch) =>
    cleaner.clean(match)
  );

  // 3. MasterBot Analysis
  const signalBot = new SignalBot();
  const analyzedMatches: AnalyzedMatch[] = await signalBot.analyze(cleanedMatches);

  // 4. Prediction (GodComplex)
  const godComplex = new GodComplex();
  const predictions: Prediction[] = await godComplex.run(analyzedMatches);

  // 5. Judge
  const judge = new JudgeEngine();
  const verdicts: Prediction[] = await Promise.all(
    predictions.map((prediction: Prediction) => judge.deliverVerdict([prediction]))
  );

  // 6. Log
  const logger = new ResponseLogger();
  verdicts.forEach((verdict: Prediction) => logger.logResponse(verdict));

  // 7. Save to DB (stub)
  await saveToDB(verdicts);

  console.log('Pipeline complete.');
}

live().catch(console.error);

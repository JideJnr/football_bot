import { fetchTodayMatches } from '../../runners/sportybet';
import { GodComplex } from '../../gods_complex/football';
import { JudgeEngine } from '../../gods_complex/football/engines/judge';
import { ResponseLogger } from '../../gods_complex/football/responses';
import { saveToDB } from '../../db/save';
import { RawMatch, CleanedMatch, AnalyzedMatch, Prediction, Verdict } from '../../type/types';
import { BasicMatchCleaner } from '../../gods_complex/football/cleaners';
import { SignalBot } from '../../gods_complex/football/signal';

async function finished() {
  // 1. Scrape
  const rawMatches: RawMatch[] = await fetchTodayMatches();

  // 2. Clean
  const cleaner = new BasicMatchCleaner();
  const cleanedMatches: CleanedMatch[] = rawMatches.map((match: RawMatch) =>
    cleaner.clean(match)
  );

  // 3. MasterBot Analysis
  const masterBot = new SignalBot();
  const analyzedMatches: AnalyzedMatch[] = await masterBot.analyze(cleanedMatches);

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

finished().catch(console.error);

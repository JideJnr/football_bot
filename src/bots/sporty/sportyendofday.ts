import { fetchEndofDayMatches } from '../../runners/sportybet';
import { saveToDB } from '../../db/save';
import { RawMatch, CleanedMatch, AnalyzedMatch, Prediction, Verdict } from '../../type/types';
import { MatchCleaner } from '../../cleaners/MatchCleaner';
import { SignalBot } from '../../gods_complex/engines/signal';

export async function finished() {
  // 1. Scrape
  const rawMatches: RawMatch[] = await fetchEndofDayMatches();

  // 2. Clean
  const cleaner = new MatchCleaner();
  const cleanedMatches: CleanedMatch[] = rawMatches.map((match: RawMatch) =>
    cleaner.clean(match)
  );

  // 3. MasterBot Analysis
  const masterBot = new SignalBot();
  const analyzedMatches: AnalyzedMatch[] = await masterBot.analyze(cleanedMatches);

  // 4. Prediction (GodComplex)
  // train const godComplex = new GodComplex();
  
  // 5. Judge
  // train const judge = new JudgeEngine();

  // 7. Save to DB (stub)
  await saveToDB(analyzedMatches);

  console.log('End of day pipeline complete complete.');
}

import { fetchTodayMatches } from '../../runners/sportybet';
import { GodComplex } from '../../gods_complex';
import { ResponseLogger } from '../../gods_complex/responses';
import { saveToDB } from '../../db/save';

import { RawMatch, CleanedMatch, AnalyzedMatch, Prediction, Verdict } from '../../type/types';
import { BasicMatchCleaner } from '../../gods_complex/engines/cleaners';
import { JudgeEngine } from '../../gods_complex/engines/judge';
import { SignalBot } from '../../gods_complex/engines/signal';

export async function today() {
  // 1. Scrape
  const rawMatches: RawMatch[] = await fetchTodayMatches();

  // 2. Clean
  const cleaner = new BasicMatchCleaner();
  const cleanedMatches: CleanedMatch[] = rawMatches.map((match: RawMatch) =>
    cleaner.clean(match)
  );

  await saveToDB(cleanedMatches);

  console.log('Pipeline complete.');
}


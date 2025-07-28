import { IMatchCleaner } from '../type/types';
import { MatchCleaner } from './MatchCleaner';

class CleanerManager {
  private cleaners: IMatchCleaner[];

  constructor() {
    this.cleaners = [
      new MatchCleaner(),
    ];
  }

  public async cleanAll(rawMatches: any[]) {
    for (const cleaner of this.cleaners) {
      await cleaner.cleanAndSave(rawMatches);
    }
  }
}

export { MatchCleaner, CleanerManager };
export type { IMatchCleaner };
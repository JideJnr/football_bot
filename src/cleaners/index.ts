import { BasicMatchCleaner } from './BasicMatchCleaner';
import { IMatchCleaner } from '../type/types';

class CleanerManager {
  private cleaners: IMatchCleaner[];

  constructor() {
    this.cleaners = [
      new BasicMatchCleaner(),
      // Add other cleaners here as you create them
    ];
  }

  public async cleanAll(rawMatches: any[]) {
    for (const cleaner of this.cleaners) {
      await cleaner.cleanAndSave(rawMatches);
    }
  }
}

export { BasicMatchCleaner, CleanerManager };
export type { IMatchCleaner };
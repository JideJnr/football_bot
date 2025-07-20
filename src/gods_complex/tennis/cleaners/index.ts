import { IMatchCleaner } from "../../../type/types";
import { BasicMatchCleaner } from "./basicCleaner";

class CleanerManager {
  private cleaners: IMatchCleaner[];

  constructor() {
    this.cleaners = [
      new BasicMatchCleaner(),
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
export type EngineVerdict = any;
export type PredictionResult = 'Success' | 'Failure' | 'Pending';

export interface RawMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  odds: Record<string, number>;
}

export interface CleanedMatch {
  id: string; 
  home: string;
  away: string;
  odds: number[];
}

export interface AnalyzedMatch {
    matchId: string;
    predictedOutcome: string;
    confidence: number;
    engine: string;
    reasoning: string;
    timestamp: Date;
}
export interface MatchData {
  id: string;
  home: string;
  away: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

export interface Verdict {
  matchId: string;
  decision: number;
  reason: string;
}

export interface EngineVerdict {
  engine: string;
  predictedOutcome: EngineVerdict;
  confidence: number;
  reasoning: string;
  timestamp: Date;
}

export interface Verdict {
  finalVerdict: EngineVerdict;
  predictions: Prediction;}

export interface AnalyzedMatch extends MatchData {
  verdict: Verdict
}

export interface Prediction {
  matchId: string;
  predictedOutcome: EngineVerdict;
  confidence: number;
  engine: string;
  reasoning: string;
  timestamp: string;
}


interface IMatchCleaner {
  cleanAndSave(rawMatches: RawMatch[]): Promise<CleanedMatch[]>;
  clean(raw: any): any;
}

export interface IMatchScraper {
  startScrapers(): void;
  processMatches(rawData: any[], type: 'today' | 'live'): Promise<any[]>;
  scheduleDailyScrape(): void;
  scheduleLiveScrape(): void;
}   

export interface IMatchAnalyzer {
  analyze(matches: MatchData[], dataType: 'today' | 'live'): Promise<PredictionResult[]>;
  run(analyzedMatches: AnalyzedMatch[]): Promise<Prediction[]>;
}   

export interface IEngine {
  analyze(match: MatchData, dataType: 'today' | 'live'): Promise<Prediction>;
} 

export interface IEngineVerdict {
  matchId: string;
  predictedOutcome: EngineVerdict;
  confidence: number;
  engine: string;
  reasoning: string;
  timestamp: string;
} 

export interface JudgeEngine {
  deliverVerdict(verdicts: EngineVerdict[]): Promise<PredictionResult>;
}

export interface ResponseLogger {
  log(response: any): void;
  saveToFile(response: any, filePath: string): Promise<void>;
}

export interface SaveToDB {
  (verdicts: Verdict[]): Promise<void>;
}

interface MatchEvent {
  minute: number;
  homeShots?: number;
  awayShots?: number;
  homeCorners?: number;
  awayCorners?: number;
  homeYellowCards?: number;
  awayYellowCards?: number;
  homeRedCards?: number;
  awayRedCards?: number;
  homeGoals?: number;
  awayGoals?: number;
  possession?: {
    home: number;
    away: number;
  };
}

interface MatchState {
  id: string;
  currentMinute: number;
  totalHomeShots: number;
  totalAwayShots: number;
  totalHomeCorners: number;
  totalAwayCorners: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  homeGoals: number;
  awayGoals: number;
  possession: {
    home: number;
    away: number;
  };
  signals: string[];
}

interface SignalConfig {
  name: string;
  condition: (state: MatchState, event: MatchEvent) => boolean;
  generateMessage: (state: MatchState, event: MatchEvent) => string;
}
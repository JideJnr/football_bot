import { AnalyzedMatch, CleanedMatch, MatchEvent, MatchState, SignalConfig } from '../type/types';
import { broadcastLog } from '../wsServer';



export class SignalBot {
  private matches: Record<string, MatchState> = {};
  private signalConfigs: SignalConfig[];
  private isRunning: boolean = false;

  constructor() {
    this.signalConfigs = this.initializeSignalConfigs();
    broadcastLog('⚙️ SignalBot initialized (Dynamic Signal Mode)');
  }

  private initializeSignalConfigs(): SignalConfig[] {
    return [
      // Shot signals
      {
        name: 'SHOT',
        condition: (state, event) => (event.homeShots || 0) > 0 || (event.awayShots || 0) > 0,
        generateMessage: (state, event) => {
          const home = event.homeShots || 0;
          const away = event.awayShots || 0;
          return `${home + away} SHOT ${event.minute} Mins (${home}H-${away}A)`;
        }
      },
      // Corner signals
      {
        name: 'CORNER',
        condition: (state, event) => (event.homeCorners || 0) > 0 || (event.awayCorners || 0) > 0,
        generateMessage: (state, event) => {
          const home = event.homeCorners || 0;
          const away = event.awayCorners || 0;
          return `${home + away} CORNER ${event.minute} Mins (${home}H-${away}A)`;
        }
      },
      // Yellow card signals
      {
        name: 'YELLOW_CARD',
        condition: (state, event) => (event.homeYellowCards || 0) > 0 || (event.awayYellowCards || 0) > 0,
        generateMessage: (state, event) => {
          const home = event.homeYellowCards || 0;
          const away = event.awayYellowCards || 0;
          return `${home + away} YELLOW ${event.minute} Mins (${home}H-${away}A)`;
        }
      },
      // Red card signals
      {
        name: 'RED_CARD',
        condition: (state, event) => (event.homeRedCards || 0) > 0 || (event.awayRedCards || 0) > 0,
        generateMessage: (state, event) => {
          const home = event.homeRedCards || 0;
          const away = event.awayRedCards || 0;
          return `${home + away} RED ${event.minute} Mins (${home}H-${away}A)`;
        }
      },
      // Goal signals
      {
        name: 'GOAL',
        condition: (state, event) => (event.homeGoals || 0) > 0 || (event.awayGoals || 0) > 0,
        generateMessage: (state, event) => {
          const home = event.homeGoals || 0;
          const away = event.awayGoals || 0;
          return `GOAL ${event.minute} Mins (${home}H-${away}A)`;
        }
      },
      // Possession dominance
      {
        name: 'POSSESSION_DOMINANCE',
        condition: (state, event) => (event.possession?.home || 0) >= 60 || (event.possession?.away || 0) >= 60,
        generateMessage: (state, event) => {
          const home = event.possession?.home || 0;
          const away = event.possession?.away || 0;
          return `POSSESSION ${home > away ? home + '%H' : away + '%A'} ${event.minute} Mins`;
        }
      },
      // Shot frequency
      {
        name: 'SHOT_FREQUENCY',
        condition: (state, event) => {
          const totalShots = (event.homeShots || 0) + (event.awayShots || 0);
          return totalShots >= 3 && event.minute <= 20;
        },
        generateMessage: (state, event) => {
          const total = (event.homeShots || 0) + (event.awayShots || 0);
          return `EARLY ${total} SHOTS ${event.minute} Mins`;
        }
      }
    ];
  }

  public start() {
    this.isRunning = true;
    broadcastLog('🟢 SignalBot started (Tracking match signals)');
  }

  public stop() {
    this.isRunning = false;
    broadcastLog('🔴 SignalBot stopped');
  }

  public initializeMatch(matchId: string): MatchState {
    const initialState: MatchState = {
      id: matchId,
      currentMinute: 0,
      totalHomeShots: 0,
      totalAwayShots: 0,
      totalHomeCorners: 0,
      totalAwayCorners: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
      homeGoals: 0,
      awayGoals: 0,
      possession: { home: 50, away: 50 },
      signals: []
    };

    this.matches[matchId] = initialState;
    return initialState;
  }

  public processMatchEvent(matchId: string, event: MatchEvent): string[] {
    if (!this.isRunning) {
      throw new Error('SignalBot is not running. Call start() first.');
    }

    if (!this.matches[matchId]) {
      this.initializeMatch(matchId);
    }

    const matchState = this.matches[matchId];
    const newSignals: string[] = [];

    // Update match state
    matchState.currentMinute = event.minute;
    matchState.totalHomeShots += event.homeShots || 0;
    matchState.totalAwayShots += event.awayShots || 0;
    matchState.totalHomeCorners += event.homeCorners || 0;
    matchState.totalAwayCorners += event.awayCorners || 0;
    matchState.homeYellowCards += event.homeYellowCards || 0;
    matchState.awayYellowCards += event.awayYellowCards || 0;
    matchState.homeRedCards += event.homeRedCards || 0;
    matchState.awayRedCards += event.awayRedCards || 0;
    matchState.homeGoals += event.homeGoals || 0;
    matchState.awayGoals += event.awayGoals || 0;
    
    if (event.possession) {
      matchState.possession = event.possession;
    }

    // Check for signals
    for (const config of this.signalConfigs) {
      if (config.condition(matchState, event)) {
        const signalMessage = config.generateMessage(matchState, event);
        newSignals.push(signalMessage);
        matchState.signals.push(signalMessage);
        broadcastLog(`📢 Signal detected for ${matchId}: ${signalMessage}`);
      }
    }

    return newSignals;
  }

  public getMatchSignals(matchId: string): string[] {
    return this.matches[matchId]?.signals || [];
  }

  public endMatch(matchId: string): MatchState {
    const finalState = this.matches[matchId];
    if (finalState) {
      broadcastLog(`🏁 Match ${matchId} ended with ${finalState.signals.length} signals`);
      delete this.matches[matchId];
    }
    return finalState;
  }

   public async analyze(cleanedMatches: CleanedMatch[]): Promise<AnalyzedMatch[]> {
    if (!this.isRunning) {
        this.start();
    }

    const analyzedMatches: AnalyzedMatch[] = [];

    for (const match of cleanedMatches) {
        // Initialize the match
        this.initializeMatch(match.id);
        
        // Create a synthetic event from the cleaned match data
        const syntheticEvent: MatchEvent = {
            minute: 0, // Using 0 to represent full match stats
            homeShots: match.statistics?.shots?.home || 0,
            awayShots: match.statistics?.shots?.away || 0,
            homeCorners: match.statistics?.corners?.home || 0,
            awayCorners: match.statistics?.corners?.away || 0,
            homeYellowCards: match.statistics?.yellowCards?.home || 0,
            awayYellowCards: match.statistics?.yellowCards?.away || 0,
            homeRedCards: match.statistics?.redCards?.home || 0,
            awayRedCards: match.statistics?.redCards?.away || 0,
            homeGoals: match.score?.home || 0,
            awayGoals: match.score?.away || 0,
            possession: match.statistics?.possession
        };

        // Process the event to generate signals
        const signals = this.processMatchEvent(match.id, syntheticEvent);

        // Create the analyzed match object
        const analyzedMatch: AnalyzedMatch = {
            ...match,
            signals,
            // Add any additional properties expected in AnalyzedMatch
            // For example:
            strengthRating: 0, // Default value
            odds: 0, // Default value
            matchId: match.id, // Assuming matchId should be the same as id
            // Add any other properties required by AnalyzedMatch
        };

        analyzedMatches.push(analyzedMatch);

        // Clean up
        this.endMatch(match.id);
    }

    broadcastLog(`🔍 SignalBot analyzed ${analyzedMatches.length} matches`);
    return analyzedMatches;
  }
}
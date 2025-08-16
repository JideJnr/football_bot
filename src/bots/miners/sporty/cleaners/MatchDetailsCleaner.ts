// src/cleaners/MatchDetailsCleaner.ts
import { broadcastLog } from "../../../../wsServer";


export interface DetailedMatch {
  eventId: string;
  gameId: string;
  productStatus: string;
  estimateStartTime: number;
  status: number;
  setScore: string;
  gameScore: string[];
  period: string;
  matchStatus: string;
  playedSeconds: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  awayTeamId: string;
  sport: any;
  markets: any[];
  bookingStatus: string;
  homeTeamIcon: string;
  awayTeamIcon: string;
  fixtureVenue: { name: string };
  eventSource: any
  // ... other fields
}

export interface CleanedMatchDetails {
  eventId: string;
  static: {
    gameId: string;
    homeTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
    awayTeamId: string;
    sport: any;
    fixtureVenue: { name: string };
    homeTeamIcon: string;
    awayTeamIcon: string;
    eventSource: any;
  };
  dynamic: {
    timestamp: Date;
    productStatus: string;
    status: number;
    setScore: string;
    gameScore: string[];
    period: string;
    matchStatus: string;
    playedSeconds: string;
    bookingStatus: string;
    markets: any[];
  }[];
}


export class MatchDetailsCleaner {
  constructor() {
    broadcastLog('🧹 MatchDetailsCleaner initialized');
  }

  public clean(raw: any): CleanedMatchDetails {
    // Safely handle gameScore (default to empty array if invalid)
    const gameScore = Array.isArray(raw.gameScore) 
      ? [...raw.gameScore] 
      : raw.gameScore 
        ? [String(raw.gameScore)] 
        : ['0:0']; // Default fallback

    // Static data (store once)
    const staticData = {
      gameId: raw.gameId || '',
      homeTeamId: raw.homeTeamId || '',
      homeTeamName: raw.homeTeamName || '',
      awayTeamName: raw.awayTeamName || '',
      awayTeamId: raw.awayTeamId || '',
      sport: raw.sport || {},
      fixtureVenue: raw.fixtureVenue || { name: '' },
      homeTeamIcon: raw.homeTeamIcon || '',
      awayTeamIcon: raw.awayTeamIcon || '',
      eventSource: raw.eventSource || {}
    };

    // Dynamic data (store with timestamp)
    const dynamicSnapshot = {
      timestamp: new Date(),
      productStatus: raw.productStatus || '',
      status: raw.status ?? 0, // Nullish coalescing
      setScore: raw.setScore || '0:0',
      gameScore: gameScore,
      period: raw.period || '',
      matchStatus: raw.matchStatus || '',
      playedSeconds: raw.playedSeconds || '00:00',
      bookingStatus: raw.bookingStatus || '',
      markets: this.cleanMarkets(raw.markets || []) // Handle missing markets
    };

    return {
      eventId: raw.eventId || '',
      static: staticData,
      dynamic: [dynamicSnapshot]
    };
  }

  private cleanMarkets(markets: any[]): any[] {
    return markets.map(market => ({
      id: market.id || '',
      desc: market.desc || '',
      status: market.status ?? 0,
      group: market.group || '',
      outcomes: (market.outcomes || []).map((outcome: any) => ({
        id: outcome.id || '',
        desc: outcome.desc || '',
        odds: outcome.odds ?? 0,
        isActive: outcome.isActive ?? 0
      }))
    }));
  }
}
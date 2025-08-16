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

  public clean(raw: DetailedMatch): CleanedMatchDetails {
    // Static data (store once)
    const staticData = {
      gameId: raw.gameId,
      homeTeamId: raw.homeTeamId,
      homeTeamName: raw.homeTeamName,
      awayTeamName: raw.awayTeamName,
      awayTeamId: raw.awayTeamId,
      sport: raw.sport,
      fixtureVenue: raw.fixtureVenue,
      homeTeamIcon: raw.homeTeamIcon,
      awayTeamIcon: raw.awayTeamIcon,
      eventSource: raw.eventSource
    };

    // Dynamic data (store with timestamp)
    const dynamicSnapshot = {
      timestamp: new Date(),
      productStatus: raw.productStatus,
      status: raw.status,
      setScore: raw.setScore,
      gameScore: [...raw.gameScore],
      period: raw.period,
      matchStatus: raw.matchStatus,
      playedSeconds: raw.playedSeconds,
      bookingStatus: raw.bookingStatus,
      markets: this.cleanMarkets(raw.markets)
    };

    return {
      eventId: raw.eventId,
      static: staticData,
      dynamic: [dynamicSnapshot]
    };
  }

  private cleanMarkets(markets: any[]): any[] {
    return markets.map(market => ({
      id: market.id,
      desc: market.desc,
      status: market.status,
      group: market.group,
      outcomes: market.outcomes.map((outcome: any) => ({
        id: outcome.id,
        desc: outcome.desc,
        odds: outcome.odds,
        isActive: outcome.isActive
      }))
    }));
  }
}
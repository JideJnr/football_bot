interface BotController {
  start: () => Promise<void>;
  stop: () => void;
  status: () => boolean;
}

interface Bot {
  id: string;
  name: string;
  status: boolean;
}

interface Outcome {
  id: string;
  odds: string;
  probability: string;
  isActive: number;
  desc: string;
}

interface Market {
  id: string;
  specifier?: string;
  product: number;
  desc: string;
  status: number;
  group: string;
  groupId: string;
  marketGuide: string;
  title: string;
  name: string;
  favourite: number;
  outcomes: Outcome[];
  farNearOdds: number;
  sourceType: string;
  availableScore: string;
  lastOddsChangeTime: number;
  banned: boolean;
  marketExtendVOS?: any[];
}

interface RawMatch {
  eventId: string;
  gameId: string;
  productStatus: string;
  estimateStartTime: number;
  status: number;
  setScore: string;
  gameScore: string[];
  pointScore: string;
  period: string;
  matchStatus: string;
  playedSeconds: string;
  remainingTimeInPeriod: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  awayTeamId: string;
  sport: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      tournament: {
        id: string;
        name: string;
      };
    };
  };
  totalMarketSize: number;
  markets: Market[];
  bookingStatus: string;
  topTeam: boolean;
  commentsNum: number;
  topicId: number;
  fixtureVenue: {
    name: string;
  };
  giftGrabActivityResultVO: {
    activityEnabled: boolean;
    enabled: boolean;
  };
  ai: boolean;
  bgEvent: boolean;
  matchTrackerNotAllowed: boolean;
  eventSource: {
    preMatchSource: {
      sourceType: string;
      sourceId: string;
    };
    liveSource: {
      sourceType: string;
      sourceId: string;
    };
  };
  banned: boolean;
}

interface CleanedMatch extends Omit<RawMatch, 'markets'> {
  markets: {
    [marketType: string]: {
      [specifier: string]: Market & {
        outcomesMap: { [desc: string]: Outcome };
      };
    };
  };
}
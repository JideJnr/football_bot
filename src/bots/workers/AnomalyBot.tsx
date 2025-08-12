// anomalyBot.ts

import { addLog } from "../../util/logger";

// Enum for anomaly types
export enum AnomalyType {
  LowMatchCount = 'LowMatchCount',
  InvalidStatus = 'InvalidStatus',
  InvalidStartTime = 'InvalidStartTime',
  MissingTeams = 'MissingTeams',
  // Add more types here as needed
}

// Structure for anomaly reports
export interface AnomalyReport {
  type: AnomalyType;
  message: string;
  eventId?: string; // optional for match-specific anomalies
}

// Your cleaned match shape (adjust fields as needed)
export interface CleanedMatch {
  eventId: string;
  status: number;
  estimateStartTime?: number; // timestamp ms
  homeTeamName?: string;
  awayTeamName?: string;
  // Add more fields if necessary
}

// Anomaly detection bot class
export class AnomalyBot {
  private previousMatchCounts: number[] = [];

  // Call this to update baseline with the current run's count
  updateBaseline(count: number) {
    this.previousMatchCounts.push(count);
    if (this.previousMatchCounts.length > 10) {
      this.previousMatchCounts.shift(); // keep last 10 counts only
    }
  }

  // Calculate dynamic baseline (median of last N runs)
  private getBaseline(): number {
    if (this.previousMatchCounts.length === 0) return 0;
    const sorted = [...this.previousMatchCounts].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  // Main detection method
  detectAnomalies(cleanedMatches: CleanedMatch[]): AnomalyReport[] {
    const reports: AnomalyReport[] = [];
    const currentCount = cleanedMatches.length;
    const baseline = this.getBaseline();

    // Low match count anomaly
    if (baseline > 0 && currentCount < baseline * 0.5) {
      reports.push({
        type: AnomalyType.LowMatchCount,
        message: `Matches count dropped to ${currentCount}, below 50% of dynamic baseline (${baseline.toFixed(
          1
        )}).`,
      });
    }

    // Checks per match
    cleanedMatches.forEach((match) => {
      if (match.status < 0) {
        reports.push({
          type: AnomalyType.InvalidStatus,
          message: `Match ${match.eventId} has invalid status: ${match.status}.`,
          eventId: match.eventId,
        });
      }

      if (
        !match.estimateStartTime ||
        match.estimateStartTime < Date.now() - 1000 * 60 * 60 * 24
      ) {
        reports.push({
          type: AnomalyType.InvalidStartTime,
          message: `Match ${match.eventId} has invalid or outdated start time: ${match.estimateStartTime}.`,
          eventId: match.eventId,
        });
      }

      if (!match.homeTeamName || !match.awayTeamName) {
        reports.push({
          type: AnomalyType.MissingTeams,
          message: `Match ${match.eventId} missing team names.`,
          eventId: match.eventId,
        });
      }
    });

    // Update baseline for next run
    this.updateBaseline(currentCount);

    return reports;
  }
}

// === Action handlers for each anomaly type ===
// Stub implementations — replace with your real logic

function alertTeam(report: AnomalyReport) {
  addLog(`🚨 ALERT TEAM: ${report.type} - ${report.message}`);
  // Send email, slack, sms, etc.
}

function throttleScraper() {
  addLog('⏳ Throttling scraper due to low data volume');
  // Pause or slow down scraper frequency here
}

function quarantineMatch(eventId?: string) {
  addLog(`🛑 Quarantining match ${eventId}`);
  // Move match to quarantine DB collection or mark as invalid
}

function logAnomaly(report: AnomalyReport) {
  addLog(`📝 Logging anomaly: ${report.type} - ${report.message}`);
  // Persist anomaly details for audit/history
}

function flagForCorrection(eventId?: string) {
  addLog(`⚠️ Flagging match ${eventId} for manual or automated correction`);
  // Add to manual review queue or auto-correct logic
}

// Dispatcher to handle anomalies by type
export function handleAnomaly(report: AnomalyReport) {
  switch (report.type) {
    case AnomalyType.LowMatchCount:
      alertTeam(report);
      throttleScraper();
      break;

    case AnomalyType.InvalidStatus:
      quarantineMatch(report.eventId);
      logAnomaly(report);
      break;

    case AnomalyType.InvalidStartTime:
      flagForCorrection(report.eventId);
      break;

    case AnomalyType.MissingTeams:
      quarantineMatch(report.eventId);
      break;

    default:
      logAnomaly(report);
  }
}

// === Example usage ===

async function pipelineStep(cleanedMatches: CleanedMatch[]) {
  const anomalyBot = new AnomalyBot();

  const anomalies = anomalyBot.detectAnomalies(cleanedMatches);

  if (anomalies.length > 0) {
    anomalies.forEach((report) => {
      console.warn(`[ANOMALY] ${report.type}: ${report.message}`);
      handleAnomaly(report);
    });
  } else {
    addLog('No anomalies detected.');
  }

  // Continue pipeline (e.g., save cleanedMatches to DB)
}

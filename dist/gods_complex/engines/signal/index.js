"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalBot = void 0;
const wsServer_1 = require("../../../wsServer");
class SignalBot {
    constructor() {
        this.matches = {};
        this.isRunning = false;
        this.signalConfigs = this.initializeSignalConfigs();
        (0, wsServer_1.broadcastLog)('⚙️ SignalBot initialized (Dynamic Signal Mode)');
    }
    initializeSignalConfigs() {
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
                condition: (state, event) => { var _a, _b; return (((_a = event.possession) === null || _a === void 0 ? void 0 : _a.home) || 0) >= 60 || (((_b = event.possession) === null || _b === void 0 ? void 0 : _b.away) || 0) >= 60; },
                generateMessage: (state, event) => {
                    var _a, _b;
                    const home = ((_a = event.possession) === null || _a === void 0 ? void 0 : _a.home) || 0;
                    const away = ((_b = event.possession) === null || _b === void 0 ? void 0 : _b.away) || 0;
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
    start() {
        this.isRunning = true;
        (0, wsServer_1.broadcastLog)('🟢 SignalBot started (Tracking match signals)');
    }
    stop() {
        this.isRunning = false;
        (0, wsServer_1.broadcastLog)('🔴 SignalBot stopped');
    }
    initializeMatch(matchId) {
        const initialState = {
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
    processMatchEvent(matchId, event) {
        if (!this.isRunning) {
            throw new Error('SignalBot is not running. Call start() first.');
        }
        if (!this.matches[matchId]) {
            this.initializeMatch(matchId);
        }
        const matchState = this.matches[matchId];
        const newSignals = [];
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
                (0, wsServer_1.broadcastLog)(`📢 Signal detected for ${matchId}: ${signalMessage}`);
            }
        }
        return newSignals;
    }
    getMatchSignals(matchId) {
        var _a;
        return ((_a = this.matches[matchId]) === null || _a === void 0 ? void 0 : _a.signals) || [];
    }
    endMatch(matchId) {
        const finalState = this.matches[matchId];
        if (finalState) {
            (0, wsServer_1.broadcastLog)(`🏁 Match ${matchId} ended with ${finalState.signals.length} signals`);
            delete this.matches[matchId];
        }
        return finalState;
    }
    analyze(cleanedMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
            if (!this.isRunning) {
                this.start();
            }
            const analyzedMatches = [];
            for (const match of cleanedMatches) {
                // Initialize the match
                this.initializeMatch(match.id);
                // Create a synthetic event from the cleaned match data
                const syntheticEvent = {
                    minute: 0, // Using 0 to represent full match stats
                    homeShots: ((_b = (_a = match.statistics) === null || _a === void 0 ? void 0 : _a.shots) === null || _b === void 0 ? void 0 : _b.home) || 0,
                    awayShots: ((_d = (_c = match.statistics) === null || _c === void 0 ? void 0 : _c.shots) === null || _d === void 0 ? void 0 : _d.away) || 0,
                    homeCorners: ((_f = (_e = match.statistics) === null || _e === void 0 ? void 0 : _e.corners) === null || _f === void 0 ? void 0 : _f.home) || 0,
                    awayCorners: ((_h = (_g = match.statistics) === null || _g === void 0 ? void 0 : _g.corners) === null || _h === void 0 ? void 0 : _h.away) || 0,
                    homeYellowCards: ((_k = (_j = match.statistics) === null || _j === void 0 ? void 0 : _j.yellowCards) === null || _k === void 0 ? void 0 : _k.home) || 0,
                    awayYellowCards: ((_m = (_l = match.statistics) === null || _l === void 0 ? void 0 : _l.yellowCards) === null || _m === void 0 ? void 0 : _m.away) || 0,
                    homeRedCards: ((_p = (_o = match.statistics) === null || _o === void 0 ? void 0 : _o.redCards) === null || _p === void 0 ? void 0 : _p.home) || 0,
                    awayRedCards: ((_r = (_q = match.statistics) === null || _q === void 0 ? void 0 : _q.redCards) === null || _r === void 0 ? void 0 : _r.away) || 0,
                    homeGoals: ((_s = match.score) === null || _s === void 0 ? void 0 : _s.home) || 0,
                    awayGoals: ((_t = match.score) === null || _t === void 0 ? void 0 : _t.away) || 0,
                    possession: (_u = match.statistics) === null || _u === void 0 ? void 0 : _u.possession
                };
                // Process the event to generate signals
                const signals = this.processMatchEvent(match.id, syntheticEvent);
                // Create the analyzed match object
                const analyzedMatch = Object.assign(Object.assign({}, match), { signals });
                analyzedMatches.push(analyzedMatch);
                // Clean up
                this.endMatch(match.id);
            }
            (0, wsServer_1.broadcastLog)(`🔍 SignalBot analyzed ${analyzedMatches.length} matches`);
            return analyzedMatches;
        });
    }
}
exports.SignalBot = SignalBot;

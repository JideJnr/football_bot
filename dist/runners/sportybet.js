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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMatchDetails = exports.fetchTodayMatches = exports.fetchEndofDayMatches = exports.fetchLiveMatches = void 0;
const axios_1 = __importDefault(require("axios"));
// Helper: Generate current timestamp for _t parameters
const getCurrentTimestamp = () => Date.now();
// Helper: Get today's time range in SportyBet's format (00:00:00 to 23:59:59)
const getTodayTimeRange = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setMilliseconds(-1);
    return {
        startTime: start.getTime(),
        endTime: end.getTime()
    };
};
// 1. LIVE MATCHES (now with dynamic _t)
const fetchLiveMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.sportybet.com/api/ng/factsCenter/configurableLiveOrPrematchEvents?sportId=sr%3Asport%3A1&withTwoUpMarket=true&withOneUpMarket=true&_t=${getCurrentTimestamp()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        return response.data.data;
    }
    catch (err) {
        console.error('Live matches error:', err instanceof Error ? err.message : 'Unknown error');
        return [];
    }
});
exports.fetchLiveMatches = fetchLiveMatches;
// 2. END OF DAY RESULTS (dynamic time range + timestamp)
const fetchEndofDayMatches = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (count = 20) {
    try {
        const { startTime, endTime } = getTodayTimeRange();
        const response = yield axios_1.default.get(`https://www.sportybet.com/api/ng/factsCenter/eventResultList?count=${count}&lastId=&sportId=sr%3Asport%3A1&startTime=${startTime}&endTime=${endTime}&_t=${getCurrentTimestamp()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        return response.data.data;
    }
    catch (err) {
        console.error('EOD matches error:', err instanceof Error ? err.message : 'Unknown error');
        return [];
    }
});
exports.fetchEndofDayMatches = fetchEndofDayMatches;
// 3. TODAY MATCHES (unchanged as requested)
const fetchTodayMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://www.sportybet.com/api/ng/factsCenter/wapConfigurableEventsByOrder', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        return response.data.data;
    }
    catch (err) {
        console.error('Today matches error:', err instanceof Error ? err.message : 'Unknown error');
        return [];
    }
});
exports.fetchTodayMatches = fetchTodayMatches;
// 4. MATCH DETAILS (unchanged as requested)
const fetchMatchDetails = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://www.sportybet.com/api/ng/factsCenter/event?productId=3&eventId=${encodeURIComponent(eventId)}&_t=${getCurrentTimestamp()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        return response.data.data;
    }
    catch (err) {
        console.error('Match details error:', err instanceof Error ? err.message : 'Unknown error');
        throw err;
    }
});
exports.fetchMatchDetails = fetchMatchDetails;

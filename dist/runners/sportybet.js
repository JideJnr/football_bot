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
exports.fetchMatchDetails = exports.fetchEndofDayMatches = exports.fetchTodayMatches = exports.fetchLiveMatches = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchLiveMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        const data = response.data.data;
        return data;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error fetching today matches:', err.message);
        }
        else {
            console.error('Unknown error fetching today matches');
        }
        return [];
    }
});
exports.fetchLiveMatches = fetchLiveMatches;
const fetchTodayMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        const data = response.data.data;
        return data;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error fetching today matches:', err.message);
        }
        else {
            console.error('Unknown error fetching today matches');
        }
        return [];
    }
});
exports.fetchTodayMatches = fetchTodayMatches;
const fetchEndofDayMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get('https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1', {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            },
        });
        const data = response.data.data;
        return data;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error fetching today matches:', err.message);
        }
        else {
            console.error('Unknown error fetching today matches');
        }
        return [];
    }
});
exports.fetchEndofDayMatches = fetchEndofDayMatches;
const fetchMatchDetails = (eventId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const encodedEventId = encodeURIComponent(eventId);
        const timestamp = Date.now();
        const url = `https://www.sportybet.com/api/ng/factsCenter/event?eventId=${encodedEventId}&productId=1&_t=${timestamp}`;
        const response = yield axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Referer': 'https://www.sportybet.com/',
                'Origin': 'https://www.sportybet.com',
            }
        });
        return response.data.data;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(`Error fetching details for ${eventId}:`, err.message);
        }
        else {
            console.error(`Unknown error fetching details for ${eventId}`);
        }
        throw err;
    }
});
exports.fetchMatchDetails = fetchMatchDetails;

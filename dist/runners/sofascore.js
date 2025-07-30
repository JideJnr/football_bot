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
exports.fetchLiveMatches = exports.fetchTodayMatches = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_HEADERS = {
    'User-Agent': 'Mozilla/5.0',
    'Accept': 'application/json',
    'Referer': 'https://www.sofascore.com/',
    'Origin': 'https://www.sofascore.com'
};
const getTodayDate = () => new Date().toISOString().split('T')[0];
const fetchTodayMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = getTodayDate(); // Dynamically set
    try {
        const { data } = yield axios_1.default.get(`https://www.sofascore.com/api/v1/sport/football/scheduled-events/${today}`, { headers: BASE_HEADERS });
        return data;
    }
    catch (err) {
        console.error(`Error fetching matches for ${today}:`, err instanceof Error ? err.message : 'Unknown error');
        return [];
    }
});
exports.fetchTodayMatches = fetchTodayMatches;
const fetchLiveMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get('https://www.sofascore.com/api/v1/sport/football/events/live', { headers: BASE_HEADERS });
        return data;
    }
    catch (err) {
        console.error('Error fetching live matches:', err instanceof Error ? err.message : 'Unknown error');
        return [];
    }
});
exports.fetchLiveMatches = fetchLiveMatches;

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
exports.finished = finished;
const sportybet_1 = require("../../runners/sportybet");
const save_1 = require("../../db/save");
const cleaners_1 = require("../../gods_complex/engines/cleaners");
const signal_1 = require("../../gods_complex/engines/signal");
function finished() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Scrape
        const rawMatches = yield (0, sportybet_1.fetchEndofDayMatches)();
        // 2. Clean
        const cleaner = new cleaners_1.BasicMatchCleaner();
        const cleanedMatches = rawMatches.map((match) => cleaner.clean(match));
        // 3. MasterBot Analysis
        const masterBot = new signal_1.SignalBot();
        const analyzedMatches = yield masterBot.analyze(cleanedMatches);
        // 4. Prediction (GodComplex)
        // train const godComplex = new GodComplex();
        // 5. Judge
        // train const judge = new JudgeEngine();
        // 7. Save to DB (stub)
        yield (0, save_1.saveToDB)(analyzedMatches);
        console.log('End of day pipeline complete complete.');
    });
}

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
const sportybet_1 = require("../runners/sportybet");
const signal_1 = require("../signal");
const football_1 = require("../gods_complex/football");
const responses_1 = require("../gods_complex/football/responses");
const save_1 = require("../db/save");
const cleaners_1 = require("../gods_complex/football/engines/cleaners");
const judge_1 = require("../gods_complex/football/engines/judge");
function live() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Scrape
        const rawMatches = yield (0, sportybet_1.fetchLiveMatches)();
        // 2. Clean
        const cleaner = new cleaners_1.BasicMatchCleaner();
        const cleanedMatches = rawMatches.map((match) => cleaner.clean(match));
        // 3. MasterBot Analysis
        const signalBot = new signal_1.SignalBot();
        const analyzedMatches = yield signalBot.analyze(cleanedMatches);
        // 4. Prediction (GodComplex)
        const godComplex = new football_1.GodComplex();
        const predictions = yield godComplex.run(analyzedMatches);
        // 5. Judge
        const judge = new judge_1.JudgeEngine();
        const verdicts = yield Promise.all(predictions.map((prediction) => judge.deliverVerdict([prediction])));
        // 6. Log
        const logger = new responses_1.ResponseLogger();
        verdicts.forEach((verdict) => logger.logResponse(verdict));
        // 7. Save to DB (stub)
        yield (0, save_1.saveToDB)(verdicts);
        console.log('Pipeline complete.');
    });
}
live().catch(console.error);

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
const sportybet_1 = require("./runners/sportybet");
const BasicMatchCleaner_1 = require("./cleaners/BasicMatchCleaner");
const master_1 = require("./master");
const gods_complex_1 = require("./gods_complex");
const judge_1 = require("./gods_complex/engines/judge");
const responses_1 = require("./gods_complex/responses");
const save_1 = require("./db/save");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Scrape
        const rawMatches = yield (0, sportybet_1.fetchTodayMatches)();
        // 2. Clean
        const cleaner = new BasicMatchCleaner_1.BasicMatchCleaner();
        const cleanedMatches = rawMatches.map((match) => cleaner.clean(match));
        // 3. MasterBot Analysis
        const masterBot = new master_1.MasterBot();
        const analyzedMatches = yield masterBot.analyze(cleanedMatches);
        // 4. Prediction (GodComplex)
        const godComplex = new gods_complex_1.GodComplex();
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
main().catch(console.error);

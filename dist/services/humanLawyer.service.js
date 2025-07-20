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
exports.HumanLawyerService = void 0;
const Verdict_1 = require("../models/Verdict");
class HumanLawyerService {
    saveVerdict(verdict) {
        return __awaiter(this, void 0, void 0, function* () {
            const newVerdict = new Verdict_1.VerdictModel(verdict);
            yield newVerdict.save();
        });
    }
    getVerdictForMatch(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Verdict_1.VerdictModel.findOne({ matchId }).exec();
        });
    }
    getAllVerdicts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Verdict_1.VerdictModel.find({}).exec();
        });
    }
}
exports.HumanLawyerService = HumanLawyerService;

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
exports.CleanerManager = exports.BasicMatchCleaner = void 0;
const basicCleaner_1 = require("./basicCleaner");
Object.defineProperty(exports, "BasicMatchCleaner", { enumerable: true, get: function () { return basicCleaner_1.BasicMatchCleaner; } });
class CleanerManager {
    constructor() {
        this.cleaners = [
            new basicCleaner_1.BasicMatchCleaner(),
        ];
    }
    cleanAll(rawMatches) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cleaner of this.cleaners) {
                yield cleaner.cleanAndSave(rawMatches);
            }
        });
    }
}
exports.CleanerManager = CleanerManager;

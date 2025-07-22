"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseLogger = void 0;
class ResponseLogger {
    constructor() {
        this.logs = [];
    }
    logResponse(response) {
        this.logs.push(response);
        console.log('Response logged:', response);
    }
    getLogs() {
        return this.logs;
    }
}
exports.ResponseLogger = ResponseLogger;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionHandler = void 0;
const responses_1 = require("../responses");
class ActionHandler {
    constructor() {
        this.responseLogger = new responses_1.ResponseLogger();
    }
    handleAction(response) {
        // Log the response for future reference
        this.responseLogger.logResponse(response);
        // Take action based on the response
        if (response.success) {
            this.takeSuccessAction(response);
        }
        else {
            this.takeFailureAction(response);
        }
    }
    takeSuccessAction(response) {
        // Implement success action logic here
        console.log('Success action taken:', response);
    }
    takeFailureAction(response) {
        // Implement failure action logic here
        console.error('Failure action taken:', response);
    }
}
exports.ActionHandler = ActionHandler;

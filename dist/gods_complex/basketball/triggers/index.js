"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerManager = void 0;
class TriggerManager {
    constructor() {
        this.reasons = [];
    }
    addReason(reason) {
        this.reasons.push(reason);
    }
    triggerBot(reason) {
        if (this.reasons.includes(reason)) {
            // Logic to trigger the appropriate bot based on the reason
            console.log(`Triggering bot for reason: ${reason}`);
            // Call to the respective bot's trigger function would go here
        }
        else {
            console.error(`Reason "${reason}" is not predefined.`);
        }
    }
}
exports.TriggerManager = TriggerManager;

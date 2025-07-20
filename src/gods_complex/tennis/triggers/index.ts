export class TriggerManager {
    private reasons: string[];

    constructor() {
        this.reasons = [];
    }

    public addReason(reason: string): void {
        this.reasons.push(reason);
    }

    public triggerBot(reason: string): void {
        if (this.reasons.includes(reason)) {
            // Logic to trigger the appropriate bot based on the reason
            console.log(`Triggering bot for reason: ${reason}`);
            // Call to the respective bot's trigger function would go here
        } else {
            console.error(`Reason "${reason}" is not predefined.`);
        }
    }
}
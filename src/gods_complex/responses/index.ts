export class ResponseLogger {
    private logs: any[] = [];

    logResponse
    (response: any): void {
        this.logs.push(response);
        console.log('Response logged:', response);
    }

    getLogs(): any[] {
        return this.logs;
    }
}


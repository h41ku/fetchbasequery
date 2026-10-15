export type RetryOnErrorOptions = {
    maxNumAttempts?: number = 5, // the maximum number of attempts
    backoffTime?: (attempt: number) => number, // delay time in milliseconds
};

export type RetryOn429Options = {
    maxNumAttempts?: number = 5, // the maximum number of attempts
    maxBackoffTime?: number = Infinity, // the maximum permissible delay time
    backoffTime?: (attempt: number, response: Response) => number, // delay time in milliseconds
};

export declare function muteErrors(): Middleware;
export declare function retryOn429(options?: RetryOn429Options): Middleware;
export declare function retryOnError(options?: RetryOnErrorOptions): Middleware;

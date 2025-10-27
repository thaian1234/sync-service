export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    name: string;
}
export declare class CircuitBreakerOpenError extends Error {
    constructor(circuitName: string);
}
declare class CircuitBreaker {
    private readonly config;
    private state;
    private failureCount;
    private successCount;
    private nextAttemptTime;
    private readonly logger;
    constructor(config: CircuitBreakerConfig);
    execute<T>(operation: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): CircuitState;
    getStats(): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        nextAttemptTime: Date;
    };
    reset(): void;
}
export declare class CircuitBreakerService {
    private readonly logger;
    private breakers;
    getBreaker(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker;
    execute<T>(breakerName: string, operation: () => Promise<T>, config?: Partial<CircuitBreakerConfig>): Promise<T>;
    getState(name: string): CircuitState | null;
    getStats(name: string): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        nextAttemptTime: Date;
    };
    getAllStats(): Record<string, any>;
    reset(name: string): void;
    resetAll(): void;
}
export {};

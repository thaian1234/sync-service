"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CircuitBreakerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerService = exports.CircuitBreakerOpenError = exports.CircuitState = void 0;
const common_1 = require("@nestjs/common");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreakerOpenError extends Error {
    constructor(circuitName) {
        super(`Circuit breaker '${circuitName}' is OPEN`);
        this.name = 'CircuitBreakerOpenError';
    }
}
exports.CircuitBreakerOpenError = CircuitBreakerOpenError;
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttemptTime = 0;
        this.logger = new common_1.Logger(`CircuitBreaker:${config.name}`);
    }
    async execute(operation) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttemptTime) {
                throw new CircuitBreakerOpenError(this.config.name);
            }
            this.state = CircuitState.HALF_OPEN;
            this.logger.warn(`Circuit breaker '${this.config.name}' entering HALF_OPEN state`);
        }
        try {
            const result = await operation();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                this.logger.log(`Circuit breaker '${this.config.name}' closed after recovery`);
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.successCount = 0;
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = Date.now() + this.config.timeout;
            this.logger.error(`Circuit breaker '${this.config.name}' opened after ${this.failureCount} failures. Next attempt at ${new Date(this.nextAttemptTime).toISOString()}`);
        }
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            nextAttemptTime: this.nextAttemptTime > 0 ? new Date(this.nextAttemptTime) : null,
        };
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttemptTime = 0;
        this.logger.log(`Circuit breaker '${this.config.name}' manually reset`);
    }
}
let CircuitBreakerService = CircuitBreakerService_1 = class CircuitBreakerService {
    constructor() {
        this.logger = new common_1.Logger(CircuitBreakerService_1.name);
        this.breakers = new Map();
    }
    getBreaker(name, config) {
        let breaker = this.breakers.get(name);
        if (!breaker) {
            const defaultConfig = Object.assign({ failureThreshold: 5, successThreshold: 2, timeout: 60000, name }, config);
            breaker = new CircuitBreaker(defaultConfig);
            this.breakers.set(name, breaker);
            this.logger.log(`Created circuit breaker '${name}' with config:`, defaultConfig);
        }
        return breaker;
    }
    async execute(breakerName, operation, config) {
        const breaker = this.getBreaker(breakerName, config);
        return breaker.execute(operation);
    }
    getState(name) {
        const breaker = this.breakers.get(name);
        return breaker ? breaker.getState() : null;
    }
    getStats(name) {
        const breaker = this.breakers.get(name);
        return breaker ? breaker.getStats() : null;
    }
    getAllStats() {
        const stats = {};
        for (const [name, breaker] of this.breakers.entries()) {
            stats[name] = breaker.getStats();
        }
        return stats;
    }
    reset(name) {
        const breaker = this.breakers.get(name);
        if (breaker) {
            breaker.reset();
        }
    }
    resetAll() {
        for (const breaker of this.breakers.values()) {
            breaker.reset();
        }
        this.logger.log('Reset all circuit breakers');
    }
};
exports.CircuitBreakerService = CircuitBreakerService;
exports.CircuitBreakerService = CircuitBreakerService = CircuitBreakerService_1 = __decorate([
    (0, common_1.Injectable)()
], CircuitBreakerService);
//# sourceMappingURL=circuit-breaker.service.js.map
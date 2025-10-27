"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.ERROR_PATTERNS = exports.DLQ_CONFIG = exports.KAFKA_CONFIG = exports.CDC_TABLE_NAMES = exports.KAFKA_TOPICS = exports.AlertSeverity = exports.DlqPriority = exports.DlqStatus = exports.CDC_TO_EVENT_TYPE = exports.CDC_OPERATION = exports.EVENT_TYPE = void 0;
exports.EVENT_TYPE = {
    CREATED: "CREATED",
    UPDATED: "UPDATED",
    DELETED: "DELETED",
    SNAPSHOT: "SNAPSHOT",
};
exports.CDC_OPERATION = {
    CREATE: "c",
    UPDATE: "u",
    DELETE: "d",
    READ: "r",
};
exports.CDC_TO_EVENT_TYPE = {
    [exports.CDC_OPERATION.CREATE]: exports.EVENT_TYPE.CREATED,
    [exports.CDC_OPERATION.UPDATE]: exports.EVENT_TYPE.UPDATED,
    [exports.CDC_OPERATION.DELETE]: exports.EVENT_TYPE.DELETED,
    [exports.CDC_OPERATION.READ]: exports.EVENT_TYPE.SNAPSHOT,
};
var DlqStatus;
(function (DlqStatus) {
    DlqStatus["PENDING"] = "PENDING";
    DlqStatus["RETRYING"] = "RETRYING";
    DlqStatus["FAILED"] = "FAILED";
    DlqStatus["SUCCESS"] = "SUCCESS";
    DlqStatus["ARCHIVED"] = "ARCHIVED";
})(DlqStatus || (exports.DlqStatus = DlqStatus = {}));
var DlqPriority;
(function (DlqPriority) {
    DlqPriority["LOW"] = "LOW";
    DlqPriority["NORMAL"] = "NORMAL";
    DlqPriority["HIGH"] = "HIGH";
    DlqPriority["CRITICAL"] = "CRITICAL";
})(DlqPriority || (exports.DlqPriority = DlqPriority = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "INFO";
    AlertSeverity["WARNING"] = "WARNING";
    AlertSeverity["ERROR"] = "ERROR";
    AlertSeverity["CRITICAL"] = "CRITICAL";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
exports.KAFKA_TOPICS = {
    CUSTOMERS: "customers.events",
    PRODUCTS: "products.events",
    ORDERS: "orders.events",
};
exports.CDC_TABLE_NAMES = {
    CUSTOMERS: "customers",
    PRODUCTS: "products",
    ORDERS: "orders",
};
exports.KAFKA_CONFIG = {
    CLIENT: {
        INITIAL_RETRY_TIME: 100,
        RETRIES: 5,
        MAX_RETRY_TIME: 10000,
        CONNECTION_TIMEOUT: 5000,
        REQUEST_TIMEOUT: 20000,
    },
    CONSUMER: {
        SESSION_TIMEOUT: 30000,
        HEARTBEAT_INTERVAL: 3000,
        AUTO_COMMIT_INTERVAL: 5000,
        PARTITIONS_CONSUMED_CONCURRENTLY: 5,
        HEALTH_CHECK_SESSION_TIMEOUT: 60000,
    },
    PRODUCER: {
        INITIAL_RETRY_TIME: 100,
        RETRIES: 3,
        MAX_RETRY_TIME: 5000,
        HEALTH_CHECK_INITIAL_RETRY_TIME: 300,
        HEALTH_CHECK_RETRIES: 5,
        HEALTH_CHECK_MAX_RETRY_TIME: 30000,
    },
    HEALTH_CHECK: {
        TIMEOUT: 5000,
        CONFIG_INITIAL_RETRY_TIME: 300,
        CONFIG_RETRIES: 5,
        CONFIG_MAX_RETRY_TIME: 30000,
    },
};
exports.DLQ_CONFIG = {
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 300000,
    JITTER_FACTOR: 0.3,
    DEFAULT_FETCH_LIMIT: 100,
    FETCH_MULTIPLIER: 2,
    DEFAULT_MAX_RETRIES: 5,
    ALERT_THRESHOLD_PENDING: 100,
    ALERT_THRESHOLD_FAILED: 10,
    ALERT_INTERVAL_MS: 300000,
};
exports.ERROR_PATTERNS = {
    RETRYABLE: {
        CONNECTION_REFUSED: "ECONNREFUSED",
        TIMEOUT: "ETIMEDOUT",
        NOT_FOUND: "ENOTFOUND",
        CONNECTION_LOST: "Connection lost",
    },
    NON_RETRYABLE: {
        DUPLICATE_ENTRY: "Duplicate entry",
        UNIQUE_CONSTRAINT: "unique constraint",
        VALIDATION_FAILED: "Validation failed",
        INVALID_DATA: "Invalid data",
    },
};
exports.ERROR_MESSAGES = {
    INVALID_CDC_EVENT_STRUCTURE: "Invalid CDC event structure",
    UNKNOWN_SOURCE_TABLE: "Unknown source table: {table}",
    UNKNOWN_CDC_OPERATION: "Unknown CDC operation: {op}",
};
//# sourceMappingURL=enums.js.map
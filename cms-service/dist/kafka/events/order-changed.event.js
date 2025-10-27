"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderChangedEvent = void 0;
const base_domain_event_1 = require("./base-domain.event");
class OrderChangedEvent extends base_domain_event_1.BaseDomainEvent {
    constructor(partial) {
        super(partial);
    }
    static generateEventId(orderId, operation, timestamp) {
        return `order-${orderId}-${operation}-${timestamp}`;
    }
    getOrderId() {
        return this.data.id;
    }
}
exports.OrderChangedEvent = OrderChangedEvent;
//# sourceMappingURL=order-changed.event.js.map
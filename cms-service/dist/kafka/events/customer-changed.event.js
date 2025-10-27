"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerChangedEvent = void 0;
const base_domain_event_1 = require("./base-domain.event");
class CustomerChangedEvent extends base_domain_event_1.BaseDomainEvent {
    constructor(partial) {
        super(partial);
    }
    static generateEventId(customerId, operation, timestamp) {
        return `customer-${customerId}-${operation}-${timestamp}`;
    }
    getCustomerId() {
        return this.data.id;
    }
}
exports.CustomerChangedEvent = CustomerChangedEvent;
//# sourceMappingURL=customer-changed.event.js.map
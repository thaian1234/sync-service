"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductChangedEvent = void 0;
const base_domain_event_1 = require("./base-domain.event");
class ProductChangedEvent extends base_domain_event_1.BaseDomainEvent {
    constructor(partial) {
        super(partial);
    }
    static generateEventId(productId, operation, timestamp) {
        return `product-${productId}-${operation}-${timestamp}`;
    }
    getProductId() {
        return this.data.id;
    }
}
exports.ProductChangedEvent = ProductChangedEvent;
//# sourceMappingURL=product-changed.event.js.map
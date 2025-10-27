"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDomainEvent = exports.EVENT_TYPE = void 0;
var enums_1 = require("../enums");
Object.defineProperty(exports, "EVENT_TYPE", { enumerable: true, get: function () { return enums_1.EVENT_TYPE; } });
class BaseDomainEvent {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.BaseDomainEvent = BaseDomainEvent;
//# sourceMappingURL=base-domain.event.js.map
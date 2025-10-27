"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchEventPattern = void 0;
const microservices_1 = require("@nestjs/microservices");
const BatchEventPattern = (topic) => (0, microservices_1.EventPattern)(topic, microservices_1.Transport.KAFKA);
exports.BatchEventPattern = BatchEventPattern;
//# sourceMappingURL=batch-event-pattern.decorator.js.map